# Development Notes

## Requirements

- Node.js 24+
- npm

## Commands

```bash
npm install
npm run typecheck
npm run build
npm test
```

## Testing strategy

Tests use Node's built-in test runner (`node:test`) and run against compiled output in `dist/`.

Current coverage focuses on pure decision logic:

- architecture normalization and fallback behavior
- release URL parsing and validation
- asset selection/ranking behavior

This keeps tests fast and deterministic without network calls.

## Refactor overview

The previous single-file implementation in `src/index.ts` has been split into focused modules:

- `run.ts` - main action workflow
- `github.ts` - HTTP/download logic
- `asset-selection.ts` - regex and asset ranking
- `architecture.ts` - architecture handling
- `release-url.ts` - release URL parsing
- `repository.ts` - repository and filename helpers
- `io.ts` - action I/O wrappers
- `regex.ts` - regex utilities
- `types.ts` - shared types

`src/index.ts` is now only the action entrypoint.
