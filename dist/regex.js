"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegExp = escapeRegExp;
exports.assertValidRegex = assertValidRegex;
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function assertValidRegex(pattern, flags) {
    try {
        // Replace {arch} with a safe literal so syntax is validated.
        new RegExp(pattern.replace(/\{arch\}/g, "x86_64"), flags);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid regex/flags combination: pattern=${pattern}, flags=${flags}. ${message}`);
    }
}
