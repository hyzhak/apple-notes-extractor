# Feature Specification: Apple Notes Export CLI

**Feature Branch**: `001-apple-notes-export`  
**Created**: 2025-11-24  
**Status**: Draft  
**Input**: User description: "CLI utility to create a dataset from local Apple Notes (macOS only). Extract note bodies, attachments, folder structure, created/modified timestamps, and note names (first line) into a target directory with `index.json`, `notes/`, and `artifacts/`. Support folder include/exclude filters, created/modified before/after filters, and an include/exclude attachments flag (default include). Output mirrors the Notes folder structure: `notes/folder/sub/<note-id>.html` and `artifacts/folder/sub/<note-id>/<artifact-id>.<ext>`; `index.json` fields: note id, note name, artifacts list, location, created at UTC, modified at UTC."

> Current scope: attachments are deferred based on probe failures; MVP exports notes-only with empty artifact arrays.

## Clarifications

### Session 2025-11-25

- Q: How should artifact filenames be stored in `index.json`? → A: Store artifact list as a JSON array of exported filenames.
- Q: Should the exported index be renamed to match JSON format? → A: Use `index.json` containing a JSON array of note records.

### Probe References (validated on real Apple Notes via @jxa/run)

- `scripts/probes/notes-multi-fields.mjs`: verified `id/name/body/creationDate/modificationDate` access and note counts.
- `scripts/probes/folder-paths.mjs`: verified folder traversal and path concatenation.
- `scripts/probes/plaintext-vs-body.mjs`: confirmed `body()` richer than `plaintext()`.
- `scripts/probes/determinism-notes.mjs`: confirmed deterministic ordering across reads.
- `scripts/probes/selection.mjs`: selection works when UI-selected (not in PRD).
- Attachment probes (`attachment-save-errorcopy.mjs`, `attachment-copy-simple.mjs`) show `attachment.save` failures; attachment export deferred.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Export full library (notes-only) with structure (Priority: P1) 🎯 MVP

Mac user wants a full offline export of all Apple Notes into a folder they control, preserving folder hierarchy, note bodies, and timestamps. Attachments are deferred to a follow-up story.

**Why this priority**: Provides the core value of owning a portable dataset of all note content with provenance; fastest path to a runnable CLI.

**Independent Test**: Run the CLI with a target directory and no filters; verify all notes appear in `index.json`, HTML bodies mirror source notes, and folder structure matches Apple Notes. Rerun to confirm determinism.

**Acceptance Scenarios**:

1. **Given** Apple Notes installed with multiple folders, **When** the user runs the CLI pointing to an empty target directory without filters, **Then** `index.json` and `notes/` are created with one record per note, and folder/id paths mirror Apple Notes.
2. **Given** an initial successful export, **When** the user re-runs the export without changing notes, **Then** the resulting files and `index.json` content are identical to the prior run (byte-for-byte determinism).

---

### User Story 2 - Targeted export by folders and dates (Priority: P2)

Researcher wants to export only selected folders or a date-bounded subset to limit data volume.

**Why this priority**: Enables scoped datasets for sharing or analysis without leaking unrelated notes.

**Independent Test**: Run the CLI with include/exclude folder filters and created/modified before/after filters; verify only matching notes appear and others are absent.

**Acceptance Scenarios**:

1. **Given** folders A and B with overlapping note dates, **When** the user runs with `include folders=A` and `created_after` set to a timestamp, **Then** only notes in folder A newer than that timestamp appear in `index.json` and exported files.
2. **Given** folders A and B, **When** the user runs with `exclude folders=B`, **Then** notes from B are absent from `index.json`, `notes/`, and `artifacts/`.

---

### User Story 3 - Attachments export (Priority: P3) 🚧 Deferred

Attachment export is postponed until a dedicated follow-up. Current MVP treats attachment lists as empty and omits `artifacts/`.

**Independent Test (when re-enabled)**: Run the CLI with attachments enabled; confirm `artifacts/` matches Apple Notes attachments and `index.json` lists filenames.

---

### Edge Cases

- Notes or attachments the user lacks permission to read.
- Notes with identical first lines (name collisions) or missing titles; ensure stable fallback naming via note id.
- Attachments with unsupported or unknown types; ensure they are still exported as raw files and recorded in `index.json`.
- Very long or nested folder paths that could exceed filesystem path limits; ensure paths are sanitized without losing uniqueness.
- Notes modified during export; capture consistent snapshot or flag partial exports.
- Target directory is not empty: default behavior is to fail fast with a clear error and no writes. A `--force`-style flag may overwrite files, but only where collisions occur (never delete unrelated files).
- Long-running exports (e.g., ~1k notes) must emit periodic progress so users are not left waiting without feedback.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The CLI MUST require a user-specified target directory and create `index.json` and `notes/` within it, failing with a clear error if the path is invalid or lacks write permission. `artifacts/` is omitted in the current MVP.
- **FR-002**: The CLI MUST extract for each note: stable note identifier, note name (first line fallback to id), body content as HTML, folder path, created-at UTC, and modified-at UTC; filenames MUST use a collision-resistant, human-readable pattern such as `<sanitized-note-name>_<note-id>`.
- **FR-003**: The CLI MUST mirror the Apple Notes folder hierarchy under `notes/` with one HTML file per note at `notes/<folders>/<sanitized-note-name>_<note-id>.html`.
- **FR-004**: Attachment export is deferred; for now the CLI MUST record an empty artifact list per note in `index.json` and skip creating `artifacts/`.
- **FR-005**: The CLI MUST support filters: folders to include, folders to exclude, created-before, created-after, modified-before, and modified-after; notes failing filters MUST be omitted from `index.json` and `notes/`.
- **FR-006**: The CLI MUST produce `index.json` records in a deterministic order and format so repeated runs on unchanged data yield identical file content and paths.
- **FR-007**: The CLI MUST operate entirely offline on the local macOS Notes data and avoid transmitting note content or metadata externally.
- **FR-008**: The CLI MUST surface structured, human-readable success and error messages including counts of exported notes (and attachments once enabled), and explicitly flag skipped notes due to filters or access issues.
- **FR-009**: The CLI MUST provide concise, modern-looking progress feedback during export (e.g., note counts, elapsed time, current folder) with periodic updates so that long runs (≈1k notes) never remain silent for extended periods, while avoiding overly verbose output.
- **FR-010**: The CLI MUST guard for macOS/Notes availability and present a clear error when run on unsupported platforms or without Automation permission.

### Key Entities _(include if feature involves data)_

- **Note**: Source Apple Note with identifier, title (first line), body HTML, folder path, created-at UTC, modified-at UTC, and attachment references.
- **Attachment**: Raw file linked to a note, with attachment id, original filename or inferred extension, and stored path under `artifacts/`.
- **Folder**: Hierarchical path representing the note’s location in Apple Notes; used to mirror directory structures in exports.
- **Index Entry**: Record in `index.json` capturing note id, note name, artifact filenames list (stored as a JSON array of exported filenames), folder path, created-at UTC, and modified-at UTC.

### Assumptions

- Apple Notes exposes a stable per-note identifier suitable for filenames and cross-referencing attachments.
- Note bodies can be reliably converted to HTML for export without loss of visible content.
- Timestamps in Apple Notes can be normalized to UTC without ambiguity; local timezone is available for conversion.
- Attachment binaries are currently not reliably retrievable via JXA; export defers artifacts until a working path is validated.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Running the CLI with default options exports 100% of readable notes into the target directory with `index.json` record count matching exported notes; attachment fields remain empty in this MVP.
- **SC-002**: Two consecutive exports on unchanged data produce identical `index.json` content and matching checksums for all generated files.
- **SC-003**: Applying folder or date filters reduces the exported set accordingly, with zero records in `index.json` for excluded folders/dates and no stray files under `notes/`.
- **SC-004**: During an export of ~1k notes, users see periodic progress updates (at least every few seconds or every fixed batch of notes) plus a final summary with counts of exported and skipped notes and elapsed time.
- **SC-005**: macOS guard and permission errors are surfaced clearly (e.g., “Apple Notes automation not available on this system”).
