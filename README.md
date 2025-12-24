# apple-notes-extractor

![Apple Notes Exporter](assets/title-image.png)

Apple Notes Extractor CLI (macOS + Apple Notes via JXA)

## Requirements

- macOS (Apple Notes access via JXA / AppleScript)
- Node.js >= 24

## Installation

- Global (installs CLI name `apple-notes-export`):

```bash
npm install -g @hyzhak/apple-notes-export
```

- Run without installing (npx — fetches published package and runs it):

```bash
npx @hyzhak/apple-notes-export --help
```

## Quick use

Export all notes to an absolute target directory.

- If you installed the package globally:

```bash
apple-notes-export --target /tmp/notes-export --force
```

- Using npx (no install):

```bash
npx @hyzhak/apple-notes-export --target /tmp/notes-export --force
```

## Folder filters

Keep only specific folders (prefix match, case-insensitive). Example using the installed CLI:

```bash
apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --include-folder "Work/Projects" "Personal"
```

Or with npx:

```bash
npx @hyzhak/apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --include-folder "Work/Projects" "Personal"
```

Exclude folders:

```bash
apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --exclude-folder "Archive" "Trash"
```

Include and exclude together (include evaluated first, then exclude):

```bash
apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --include-folder "Work" \
  --exclude-folder "Work/Secret"
```

Notes:

- Paths are matched by prefix; `Work` matches `Work/Sub/Note`.
- Attachments flag exists but export is not implemented yet; CLI will warn and proceed without attachments.

## Verbosity

- Default: info (progress + per-note/skip lines).
- Quiet: `--quiet` or `-q` (progress only).
- Verbose: `-v` adds extra detail; `-vv` enables debug (also set by `NOTES_DEBUG=1`).

## Date filters

Filter by created/modified timestamps (UTC, inclusive bounds):

```bash
apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --created-after 2024-01-01T00:00:00Z \
  --modified-before 2024-12-31T23:59:59Z
```

Or with npx:

```bash
npx @hyzhak/apple-notes-export \
  --target /tmp/notes-export \
  --force \
  --created-after 2024-01-01T00:00:00Z \
  --modified-before 2024-12-31T23:59:59Z
```

## Development

For working on the project locally (developer workflow):

```bash
npm install
npm run lint
npm test
npm run build
```

Notes on validating README examples:
- Use `npx @hyzhak/apple-notes-export --help` to confirm the published CLI's help text matches these examples.
- To validate an actual export (will contact npm and run on macOS), run:
  - `npx @hyzhak/apple-notes-export --target /tmp/test-export --force`
