export function validateRepository(repository: string): void {
  if (!repository || !repository.includes("/")) {
    throw new Error(`repository must be in owner/repo form. Received: ${repository || "<empty>"}`);
  }

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new Error(`repository must be in owner/repo form. Received: ${repository}`);
  }
}

export function resolveOutputFileName(repository: string, userFileName: string): string {
  const repoName = repository.split("/")[1] || "download";
  let outputFileName = userFileName || `${repoName}.rpm`;

  if (!outputFileName.toLowerCase().endsWith(".rpm")) {
    outputFileName = `${outputFileName}.rpm`;
  }

  return outputFileName;
}
