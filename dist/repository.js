"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRepository = validateRepository;
exports.resolveOutputFileName = resolveOutputFileName;
function validateRepository(repository) {
    if (!repository || !repository.includes("/")) {
        throw new Error(`repository must be in owner/repo form. Received: ${repository || "<empty>"}`);
    }
    const [owner, repo] = repository.split("/");
    if (!owner || !repo) {
        throw new Error(`repository must be in owner/repo form. Received: ${repository}`);
    }
}
function resolveOutputFileName(repository, userFileName) {
    const repoName = repository.split("/")[1] || "download";
    let outputFileName = userFileName || `${repoName}.rpm`;
    if (!outputFileName.toLowerCase().endsWith(".rpm")) {
        outputFileName = `${outputFileName}.rpm`;
    }
    return outputFileName;
}
