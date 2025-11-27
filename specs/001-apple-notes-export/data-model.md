# Data Model

## Entities

### Note

- Fields:
  - `id` (string, stable Apple Notes identifier, required, unique)
  - `name` (string, first line fallback to `id`, required)
  - `bodyHtml` (string, required)
  - `folderPath` (string, required, e.g., `Personal/Work`)
  - `createdAtUtc` (string ISO 8601, required)
  - `modifiedAtUtc` (string ISO 8601, required)
  - `attachments` (Attachment[], required, can be empty)
- Relationships: one-to-many with `Attachment` via `noteId`.
- Constraints:
  - Body is stored as HTML exactly as sourced (no added frontmatter or metadata inside the file).
  - Filenames use deterministic slug `<sanitized-name>_<id>`.
  - On disk, note HTML files should have file created/modified timestamps set to the note’s created/modified values.
  - Ordering for export sorted by `folderPath` then `id` for determinism.

### Attachment

- Fields:
  - `id` (string, required, unique per note)
  - `originalName` (string, optional)
  - `extension` (string, optional, inferred when missing)
  - `storedPath` (string, required when exported, relative to `artifacts/`)
- Relationships: belongs to `Note`.
- Constraints:
  - Exported path: `artifacts/<folderPath>/<sanitized-name>_<noteId>/<attachmentId>.<ext>`.
  - Unsupported types still exported as raw files; extension inferred or defaulted.

### IndexEntry

- Fields:
  - `noteId` (string, required)
  - `noteName` (string, required)
  - `artifacts` (string[] of exported filenames, required, can be empty)
  - `folderPath` (string, required)
  - `createdAtUtc` (string ISO 8601, required)
  - `modifiedAtUtc` (string ISO 8601, required)
- Relationships: derived from `Note` and its `Attachment`s.
- Constraints:
  - Serialized as JSON objects in deterministic array order.
  - Artifact filenames mirror on-disk paths; empty array when attachments skipped.
  - Index captures metadata; note HTML files remain metadata-free.

### Folder (logical)

- Fields:
  - `path` (string, required)
- Relationships: groups `Note`s hierarchically.
- Constraints:
  - Mirrored under `notes/` and `artifacts/`.
  - Sanitization must preserve uniqueness and ordering without truncating below uniqueness.

## Validation Rules

- Reject export if target directory is non-empty unless `--force` explicitly allows overwrites without deleting unrelated files.
- Filters:
  - Include/Exclude folders: match against `folderPath` prefixes.
  - Date filters: compare `createdAtUtc`/`modifiedAtUtc` against provided bounds.
- Determinism:
  - Stable sort order and filename generation; reruns on unchanged data must produce identical `index.json` and files.
- Progress and errors:
  - Structured messages include counts and note identifiers without leaking content.
