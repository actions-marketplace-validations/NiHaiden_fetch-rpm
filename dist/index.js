"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = require("./run");
(0, run_1.run)().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    process.exit(1);
});
