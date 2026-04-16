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
exports.run = run;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const architecture_1 = require("./architecture");
const github_1 = require("./github");
const io_1 = require("./io");
const regex_1 = require("./regex");
const release_url_1 = require("./release-url");
const repository_1 = require("./repository");
const asset_selection_1 = require("./asset-selection");
const DEFAULT_ASSET_REGEX = "^(?!.*\\.src\\.rpm$).*{arch}.*\\.rpm$";
async function run() {
    const releaseUrl = (0, io_1.getInput)("release-url");
    let repository = (0, io_1.getInput)("repository");
    let tag = (0, io_1.getInput)("tag");
    if (releaseUrl) {
        const parsed = (0, release_url_1.parseReleaseUrl)(releaseUrl);
        if (!repository) {
            repository = parsed.repository;
        }
        if (!tag) {
            tag = parsed.tag;
        }
    }
    (0, repository_1.validateRepository)(repository);
    const token = (0, io_1.getInput)("token", "");
    const pattern = (0, io_1.getInput)("asset-regex", DEFAULT_ASSET_REGEX);
    const flags = (0, io_1.getInput)("regex-flags", "i");
    const downloadDirInput = (0, io_1.getInput)("download-dir", ".");
    const userFileName = (0, io_1.getInput)("file-name", "");
    (0, regex_1.assertValidRegex)(pattern, flags);
    const resolvedArch = (0, architecture_1.detectArchitecture)((0, io_1.getInput)("arch", ""), {
        runnerArch: process.env.RUNNER_ARCH || "",
        nodeArch: process.arch,
    });
    const archCandidates = (0, architecture_1.archCandidatesFor)(resolvedArch);
    console.log(`Resolved repository: ${repository}`);
    console.log(`Resolved tag: ${tag || "<latest>"}`);
    console.log(`Resolved architecture: ${resolvedArch}`);
    console.log(`Architecture candidates: ${archCandidates.join(", ")}`);
    console.log(`Asset regex: /${pattern}/${flags}`);
    const release = await (0, github_1.fetchRelease)({ repository, tag, token });
    const assets = Array.isArray(release.assets) ? release.assets : [];
    if (assets.length === 0) {
        throw new Error(`Release ${release.tag_name || tag || "<latest>"} in ${repository} has no assets`);
    }
    const selection = (0, asset_selection_1.selectAsset)({
        assets,
        pattern,
        flags,
        archCandidates,
    });
    if (!selection) {
        const available = assets.map((asset) => `- ${asset.name}`).join("\n");
        throw new Error(`No asset matched regex /${pattern}/${flags} for architecture candidates [${archCandidates.join(", ")}] in ${repository}@${release.tag_name}.\nAvailable assets:\n${available}`);
    }
    if (selection.allMatches.length > 1) {
        const shown = selection.allMatches
            .slice(0, 5)
            .map((asset) => asset.name)
            .join(", ");
        console.log(`::warning::Multiple assets matched (${selection.allMatches.length}). Selected "${selection.asset.name}". First matches: ${shown}`);
    }
    const outputFileName = (0, repository_1.resolveOutputFileName)(repository, userFileName);
    const downloadDir = path.resolve(downloadDirInput);
    fs.mkdirSync(downloadDir, { recursive: true });
    const destinationPath = path.join(downloadDir, outputFileName);
    console.log(`Matched pattern: ${selection.matchedPattern}`);
    console.log(`Matched arch token: ${selection.matchedArch}`);
    console.log(`Downloading asset: ${selection.asset.name}`);
    console.log(`Saving as: ${destinationPath}`);
    await (0, github_1.downloadAsset)({
        repository,
        assetId: selection.asset.id,
        token,
        destinationPath,
    });
    (0, io_1.setOutput)("file-path", destinationPath);
    (0, io_1.setOutput)("asset-name", selection.asset.name);
    (0, io_1.setOutput)("release-tag", release.tag_name || tag || "");
    (0, io_1.setOutput)("repository", repository);
    (0, io_1.setOutput)("arch", resolvedArch);
    (0, io_1.setOutput)("matched-arch", selection.matchedArch);
    console.log("RPM download complete.");
}
