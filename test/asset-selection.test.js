const test = require("node:test");
const assert = require("node:assert/strict");

const { selectAsset } = require("../dist/asset-selection.js");

const assets = [
  { id: 1, name: "pkg-1.0.0-x86_64.rpm" },
  { id: 2, name: "pkg-1.0.0-noarch.rpm" },
  { id: 3, name: "pkg-debuginfo-1.0.0-x86_64.rpm" },
  { id: 4, name: "pkg-1.0.0-aarch64.rpm" },
  { id: 5, name: "pkg-1.0.0.src.rpm" },
];

test("selectAsset prefers first matching arch candidate with {arch}", () => {
  const selection = selectAsset({
    assets,
    pattern: "^pkg-.*{arch}.*\\.rpm$",
    flags: "i",
    archCandidates: ["aarch64", "x86_64", "noarch"],
  });

  assert.ok(selection);
  assert.equal(selection.matchedArch, "aarch64");
  assert.equal(selection.asset.name, "pkg-1.0.0-aarch64.rpm");
});

test("selectAsset ranks by arch hit and penalties when regex has no {arch}", () => {
  const selection = selectAsset({
    assets,
    pattern: "^pkg-.*\\.rpm$",
    flags: "i",
    archCandidates: ["x86_64", "noarch"],
  });

  assert.ok(selection);
  assert.equal(selection.asset.name, "pkg-1.0.0-x86_64.rpm");
  assert.equal(selection.matchedArch, "x86_64");

  // debuginfo/src RPMs should appear later in the sorted matches.
  const names = selection.allMatches.map((asset) => asset.name);
  assert.equal(names[names.length - 1], "pkg-1.0.0.src.rpm");
});

test("selectAsset returns null when no assets match", () => {
  const selection = selectAsset({
    assets,
    pattern: "^does-not-exist.*$",
    flags: "i",
    archCandidates: ["x86_64"],
  });

  assert.equal(selection, null);
});
