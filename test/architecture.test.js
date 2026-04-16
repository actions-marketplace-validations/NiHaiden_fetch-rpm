const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeArch,
  archCandidatesFor,
  detectArchitecture,
} = require("../dist/architecture.js");

test("normalizeArch maps known aliases", () => {
  assert.equal(normalizeArch("x64"), "x86_64");
  assert.equal(normalizeArch("AMD64"), "x86_64");
  assert.equal(normalizeArch("arm64"), "aarch64");
  assert.equal(normalizeArch("i386"), "i686");
});

test("detectArchitecture uses explicit input first", () => {
  const result = detectArchitecture("arm64", {
    runnerArch: "x64",
    nodeArch: "x64",
  });

  assert.equal(result, "aarch64");
});

test("detectArchitecture falls back to runner, then node, then default", () => {
  assert.equal(
    detectArchitecture("", {
      runnerArch: "amd64",
      nodeArch: "arm64",
    }),
    "x86_64",
  );

  assert.equal(
    detectArchitecture("", {
      runnerArch: "",
      nodeArch: "arm64",
    }),
    "aarch64",
  );

  assert.equal(detectArchitecture("", {}), "x86_64");
});

test("archCandidatesFor returns expected aliases", () => {
  assert.deepEqual(archCandidatesFor("x86_64"), ["x86_64", "amd64", "x64", "noarch"]);
  assert.deepEqual(archCandidatesFor("custom"), ["custom", "noarch"]);
});
