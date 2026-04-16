"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeArch = normalizeArch;
exports.archCandidatesFor = archCandidatesFor;
exports.detectArchitecture = detectArchitecture;
function normalizeArch(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
        return "";
    }
    const map = {
        x64: "x86_64",
        amd64: "x86_64",
        "x86-64": "x86_64",
        x86_64: "x86_64",
        arm64: "aarch64",
        aarch64: "aarch64",
        armv8: "aarch64",
        arm: "armv7hl",
        armv7: "armv7hl",
        armv7l: "armv7hl",
        armv7hl: "armv7hl",
        armhf: "armv7hl",
        ia32: "i686",
        x86: "i686",
        i386: "i686",
        i686: "i686",
        ppc64le: "ppc64le",
        s390x: "s390x",
        noarch: "noarch",
    };
    return map[normalized] || normalized;
}
function archCandidatesFor(arch) {
    switch (arch) {
        case "x86_64":
            return ["x86_64", "amd64", "x64", "noarch"];
        case "aarch64":
            return ["aarch64", "arm64", "noarch"];
        case "armv7hl":
            return ["armv7hl", "armv7", "armhf", "arm", "noarch"];
        case "i686":
            return ["i686", "i386", "x86", "noarch"];
        case "ppc64le":
            return ["ppc64le", "noarch"];
        case "s390x":
            return ["s390x", "noarch"];
        case "noarch":
            return ["noarch"];
        default:
            return [arch, "noarch"];
    }
}
function detectArchitecture(inputArch, options = {}) {
    const explicit = normalizeArch(inputArch);
    if (explicit) {
        return explicit;
    }
    const runnerArch = normalizeArch(options.runnerArch || "");
    if (runnerArch) {
        return runnerArch;
    }
    const nodeArch = normalizeArch(options.nodeArch || "");
    if (nodeArch) {
        return nodeArch;
    }
    return options.defaultArch || "x86_64";
}
