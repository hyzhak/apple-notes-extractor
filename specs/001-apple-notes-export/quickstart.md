# Quickstart

## Prerequisites

- macOS with Apple Notes data available locally
- Node.js 24.x LTS + npm

## Install

```bash
npm install -g @smart-notes/apple-notes-export
```

Or run without global install:

```bash
npx @smart-notes/apple-notes-export --help
```

## Usage

```bash
apple-notes-export \
  --target /path/to/output \
  --force \
  --include-folder "Work/Research" \
  --exclude-folder "Archive" \
  --created-after "2024-01-01T00:00:00Z" \
  --modified-before "2025-12-31T23:59:59Z" \
  -q
```

Flags (most used):

- `--target <abs-dir>` (required): output root (creates `notes/` + `index.json`).
- `--force`: allow writing to a non-empty target.
- `--include-folder / --exclude-folder`: prefix matches, case-insensitive.
- `--created-after/--created-before/--modified-after/--modified-before`: UTC ISO strings.
- `-q/--quiet`: progress only; `-v`/`-vv` to increase verbosity.
- `--include-attachments`: accepted but not implemented yet; a warning is printed and attachments are skipped.

Notes:

- Attachments remain disabled; `artifacts/` stays empty for now.
- Progress prints every few seconds; per-note lines show only when not `-q`.
- The CLI exits non-zero on failures; summaries are printed to stdout on success.

## Development

```bash
npm install
npm run lint
npm run test           # vitest unit/contract
npm run build          # tsup bundles cli + lib
```

## Release & Publish

- Create a SemVer tag `vX.Y.Z` on `001-apple-notes-export` branch (after tests pass).
- GitHub Actions workflow runs lint/test/build, then `npm publish` with `NODE_AUTH_TOKEN` secret.
- Breaking export format changes require a major version bump and migration notes.
