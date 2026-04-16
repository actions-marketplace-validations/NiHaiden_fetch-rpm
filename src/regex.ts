export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertValidRegex(pattern: string, flags: string): void {
  try {
    // Replace {arch} with a safe literal so syntax is validated.
    new RegExp(pattern.replace(/\{arch\}/g, "x86_64"), flags);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid regex/flags combination: pattern=${pattern}, flags=${flags}. ${message}`);
  }
}
