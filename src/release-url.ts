export type ParsedReleaseUrl = {
  repository: string;
  tag: string;
};

export function parseReleaseUrl(releaseUrl: string): ParsedReleaseUrl {
  let url: URL;
  try {
    url = new URL(releaseUrl);
  } catch {
    throw new Error(`Invalid release-url: ${releaseUrl}`);
  }

  if (!/^github\.com$/i.test(url.hostname)) {
    throw new Error(`release-url must point to github.com: ${releaseUrl}`);
  }

  const parts = url.pathname.split("/").filter(Boolean);

  // owner/repo/releases/tag/<tag>
  if (parts.length < 4 || parts[2] !== "releases") {
    throw new Error(`release-url is not a GitHub release URL: ${releaseUrl}`);
  }

  const repository = `${parts[0]}/${parts[1]}`;

  if (parts[3] === "latest") {
    return { repository, tag: "" };
  }

  if (parts[3] !== "tag") {
    throw new Error(`release-url must be /releases/tag/<tag> or /releases/latest: ${releaseUrl}`);
  }

  const rawTag = parts.slice(4).join("/");
  if (!rawTag) {
    throw new Error(`release-url does not include a tag: ${releaseUrl}`);
  }

  return {
    repository,
    tag: decodeURIComponent(rawTag),
  };
}
