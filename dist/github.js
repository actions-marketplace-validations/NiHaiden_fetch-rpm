"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRequest = githubRequest;
exports.fetchRelease = fetchRelease;
exports.downloadAsset = downloadAsset;
const fs = __importStar(require("node:fs"));
const node_stream_1 = require("node:stream");
const promises_1 = require("node:stream/promises");
async function githubRequest(url, token, accept = "application/vnd.github+json") {
    const headers = {
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
        }
        catch {
            // ignore secondary failure
        }
        throw new Error(`GitHub request failed (${response.status} ${response.statusText}) for ${url}${body ? `\n${body.slice(0, 500)}` : ""}`);
    }
    return response;
}
async function fetchRelease(params) {
    const { repository, tag, token } = params;
    const [owner, repo] = repository.split("/");
    const endpoint = tag
        ? `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/tags/${encodeURIComponent(tag)}`
        : `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`;
    const response = await githubRequest(endpoint, token);
    return (await response.json());
}
async function downloadAsset(params) {
    const { repository, assetId, token, destinationPath } = params;
    const [owner, repo] = repository.split("/");
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/assets/${assetId}`;
    const response = await githubRequest(endpoint, token, "application/octet-stream");
    const body = response.body;
    if (!body) {
        throw new Error("Download response had no body");
    }
    const readable = node_stream_1.Readable.fromWeb(body);
    await (0, promises_1.pipeline)(readable, fs.createWriteStream(destinationPath));
}
