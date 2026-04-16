import * as fs from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Release } from "./types";

export async function githubRequest(
  url: string,
  token: string,
  accept = "application/vnd.github+json",
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": "fetch-rpm-action",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    redirect: "follow",
  });

  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch {
      // ignore secondary failure
    }

    throw new Error(
      `GitHub request failed (${response.status} ${response.statusText}) for ${url}${
        body ? `\n${body.slice(0, 500)}` : ""
      }`,
    );
  }

  return response;
}

export async function fetchRelease(params: {
  repository: string;
  tag: string;
  token: string;
}): Promise<Release> {
  const { repository, tag, token } = params;
  const [owner, repo] = repository.split("/");

  const endpoint = tag
    ? `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/tags/${encodeURIComponent(tag)}`
    : `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`;

  const response = await githubRequest(endpoint, token);
  return (await response.json()) as Release;
}

export async function downloadAsset(params: {
  repository: string;
  assetId: number;
  token: string;
  destinationPath: string;
}): Promise<void> {
  const { repository, assetId, token, destinationPath } = params;
  const [owner, repo] = repository.split("/");
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/assets/${assetId}`;

  const response = await githubRequest(endpoint, token, "application/octet-stream");
  const body = response.body;

  if (!body) {
    throw new Error("Download response had no body");
  }

  const readable = Readable.fromWeb(body as unknown as import("node:stream/web").ReadableStream);
  await pipeline(readable, fs.createWriteStream(destinationPath));
}
