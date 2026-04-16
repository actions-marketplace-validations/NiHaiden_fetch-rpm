const test = require("node:test");
const assert = require("node:assert/strict");

const { parseReleaseUrl } = require("../dist/release-url.js");

test("parseReleaseUrl extracts repository and tag", () => {
  const parsed = parseReleaseUrl(
    "https://github.com/example/project/releases/tag/v1.2.3",
  );

  assert.deepEqual(parsed, {
    repository: "example/project",
    tag: "v1.2.3",
  });
});

test("parseReleaseUrl supports latest endpoint", () => {
  const parsed = parseReleaseUrl("https://github.com/example/project/releases/latest");

  assert.deepEqual(parsed, {
    repository: "example/project",
    tag: "",
  });
});

test("parseReleaseUrl decodes encoded tags", () => {
  const parsed = parseReleaseUrl(
    "https://github.com/example/project/releases/tag/release%2Fstable",
  );

  assert.deepEqual(parsed, {
    repository: "example/project",
    tag: "release/stable",
  });
});

test("parseReleaseUrl rejects non-GitHub URLs", () => {
  assert.throws(
    () => parseReleaseUrl("https://gitlab.com/example/project/releases/tag/v1"),
    /must point to github\.com/,
  );
});
