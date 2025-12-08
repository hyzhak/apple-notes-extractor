# apple-notes-extractor

Apple Notes Extractor CLI (macOS + Apple Notes via JXA)

## Quick use

```bash
# Export all notes to an absolute target directory
node dist/cli.js --target /tmp/notes-export --force
```

## Folder filters

Keep only specific folders (prefix match, case-insensitive):

```bash
node dist/cli.js \
  --target /tmp/notes-export \
  --force \
  --include-folder "Work/Projects" "Personal"
```

Exclude folders:

```bash
node dist/cli.js \
  --target /tmp/notes-export \
  --force \
  --exclude-folder "Archive" "Trash"
```

Include and exclude together (include evaluated first, then exclude):

```bash
node dist/cli.js \
  --target /tmp/notes-export \
  --force \
  --include-folder "Work" \
  --exclude-folder "Work/Secret"
```

Notes:

- Paths are matched by prefix; `Work` matches `Work/Sub/Note`.
- Attachments flag exists but export is not implemented yet; CLI will warn and proceed without attachments.

## Date filters

Filter by created/modified timestamps (UTC, inclusive bounds):

```bash
node dist/cli.js \
  --target /tmp/notes-export \
  --force \
  --created-after 2024-01-01T00:00:00Z \
  --modified-before 2024-12-31T23:59:59Z
```

## Development

```bash
npm install
npm run lint
npm test
npm run build
```
