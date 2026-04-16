# fetch-rpm (TypeScript GitHub Action)

Download an RPM from a GitHub release and save it with a predictable filename (default: `<repo>.rpm`).

The action picks the best asset based on:
- your resolved architecture (`arch`, `RUNNER_ARCH`, or Node arch)
- a configurable regex (`asset-regex`)
- built-in penalties for `debuginfo`/`debugsource` and source RPMs

> Runtime: **Node 24** (`runs.using: node24`)

## Inputs

- `release-url` (optional): full release URL, e.g. `https://github.com/owner/repo/releases/tag/v1.2.3`
- `repository` (optional): `owner/repo`
- `tag` (optional): release tag (if omitted, latest release)
- `token` (optional): GitHub token (defaults to `${{ github.token }}`)
- `asset-regex` (optional): regex to match asset name, supports `{arch}` placeholder
- `regex-flags` (optional): regex flags, default `i`
- `arch` (optional): force arch (`x86_64`, `aarch64`, ...)
- `download-dir` (optional): output directory, default `.`
- `file-name` (optional): output filename, default `<repo>.rpm`

## Outputs

- `file-path`
- `asset-name`
- `release-tag`
- `repository`
- `arch`
- `matched-arch`

## Architecture matching

Example alias expansion:

- `x86_64` -> `x86_64`, `amd64`, `x64`, `noarch`
- `aarch64` -> `aarch64`, `arm64`, `noarch`

If your regex contains `{arch}`, the action replaces it with candidates in order until one matches.

## Example usage

```yaml
name: Fetch RPM

on:
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Fetch RPM from release
        id: rpm
        uses: ./.
        with:
          release-url: https://github.com/xarbit/plasma6-applet-appgrid/releases/tag/v1.7.8
          # Default regex:
          # ^(?!.*\.src\.rpm$).*{arch}.*\.rpm$

      - name: Show result
        run: |
          echo "Downloaded: ${{ steps.rpm.outputs.file-path }}"
          echo "Asset: ${{ steps.rpm.outputs.asset-name }}"
```

## Development

```bash
npm install
npm run typecheck
npm test
```

### Project structure

- `src/run.ts` - orchestration for inputs, selection, download, outputs
- `src/github.ts` - GitHub API requests and binary asset download
- `src/asset-selection.ts` - regex matching, arch ranking, and tie-breaking
- `src/architecture.ts` - architecture normalization and candidate expansion
- `src/release-url.ts` - release URL parser
- `src/repository.ts` - repository/file-name validation and helpers
- `src/io.ts` - GitHub Action input/output helpers
- `test/*.test.js` - unit tests (Node test runner)

For more details, see `docs/DEVELOPMENT.md`.
