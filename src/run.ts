import * as fs from "node:fs";
import * as path from "node:path";
import { archCandidatesFor, detectArchitecture } from "./architecture";
import { downloadAsset, fetchRelease } from "./github";
import { getInput, setOutput } from "./io";
import { assertValidRegex } from "./regex";
import { parseReleaseUrl } from "./release-url";
import { resolveOutputFileName, validateRepository } from "./repository";
import { selectAsset } from "./asset-selection";

const DEFAULT_ASSET_REGEX = "^(?!.*\\.src\\.rpm$).*{arch}.*\\.rpm$";

export async function run(): Promise<void> {
  const releaseUrl = getInput("release-url");
  let repository = getInput("repository");
  let tag = getInput("tag");

  if (releaseUrl) {
    const parsed = parseReleaseUrl(releaseUrl);

    if (!repository) {
      repository = parsed.repository;
    }

    if (!tag) {
      tag = parsed.tag;
    }
  }

  validateRepository(repository);

  const token = getInput("token", "");
  const pattern = getInput("asset-regex", DEFAULT_ASSET_REGEX);
  const flags = getInput("regex-flags", "i");
  const downloadDirInput = getInput("download-dir", ".");
  const userFileName = getInput("file-name", "");

  assertValidRegex(pattern, flags);

  const resolvedArch = detectArchitecture(getInput("arch", ""), {
    runnerArch: process.env.RUNNER_ARCH || "",
    nodeArch: process.arch,
  });
  const archCandidates = archCandidatesFor(resolvedArch);

  console.log(`Resolved repository: ${repository}`);
  console.log(`Resolved tag: ${tag || "<latest>"}`);
  console.log(`Resolved architecture: ${resolvedArch}`);
  console.log(`Architecture candidates: ${archCandidates.join(", ")}`);
  console.log(`Asset regex: /${pattern}/${flags}`);

  const release = await fetchRelease({ repository, tag, token });
  const assets = Array.isArray(release.assets) ? release.assets : [];

  if (assets.length === 0) {
    throw new Error(`Release ${release.tag_name || tag || "<latest>"} in ${repository} has no assets`);
  }

  const selection = selectAsset({
    assets,
    pattern,
    flags,
    archCandidates,
  });

  if (!selection) {
    const available = assets.map((asset) => `- ${asset.name}`).join("\n");

    throw new Error(
      `No asset matched regex /${pattern}/${flags} for architecture candidates [${archCandidates.join(", ")}] in ${repository}@${release.tag_name}.\nAvailable assets:\n${available}`,
    );
  }

  if (selection.allMatches.length > 1) {
    const shown = selection.allMatches
      .slice(0, 5)
      .map((asset) => asset.name)
      .join(", ");

    console.log(
      `::warning::Multiple assets matched (${selection.allMatches.length}). Selected "${selection.asset.name}". First matches: ${shown}`,
    );
  }

  const outputFileName = resolveOutputFileName(repository, userFileName);
  const downloadDir = path.resolve(downloadDirInput);
  fs.mkdirSync(downloadDir, { recursive: true });

  const destinationPath = path.join(downloadDir, outputFileName);

  console.log(`Matched pattern: ${selection.matchedPattern}`);
  console.log(`Matched arch token: ${selection.matchedArch}`);
  console.log(`Downloading asset: ${selection.asset.name}`);
  console.log(`Saving as: ${destinationPath}`);

  await downloadAsset({
    repository,
    assetId: selection.asset.id,
    token,
    destinationPath,
  });

  setOutput("file-path", destinationPath);
  setOutput("asset-name", selection.asset.name);
  setOutput("release-tag", release.tag_name || tag || "");
  setOutput("repository", repository);
  setOutput("arch", resolvedArch);
  setOutput("matched-arch", selection.matchedArch);

  console.log("RPM download complete.");
}
