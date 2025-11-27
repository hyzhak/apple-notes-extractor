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
  --include-folders "Work/Research" \
  --exclude-folders "Personal" \
  --created-after "2024-01-01T00:00:00Z" \
  --attachments=true
```

- Default includes attachments; set `--attachments=false` for text-only.
- Fails fast if target directory is non-empty unless `--force` provided (overwrites collisions only).
- Progress prints periodic counts; final JSON summary emitted on completion.

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
