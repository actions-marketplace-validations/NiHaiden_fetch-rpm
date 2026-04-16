import * as fs from "node:fs";

export function getInput(name: string, fallback = ""): string {
  const key = `INPUT_${name.replace(/ /g, "_").replace(/-/g, "_").toUpperCase()}`;
  const raw = process.env[key];

  if (raw === undefined || raw === null) {
    return fallback;
  }

  const value = String(raw).trim();
  return value === "" ? fallback : value;
}

export function setOutput(name: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  const text = String(value ?? "");

  if (!outputFile) {
    // Legacy fallback.
    console.log(`::set-output name=${name}::${text}`);
    return;
  }

  fs.appendFileSync(outputFile, `${name}<<__EOF__\n${text}\n__EOF__\n`);
}
