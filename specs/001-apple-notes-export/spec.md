# Feature Specification: Apple Notes Export CLI

**Feature Branch**: `001-apple-notes-export`  
**Created**: 2025-11-24  
**Status**: Draft  
**Input**: User description: "CLI utility to create a dataset from local Apple Notes (macOS only). Extract note bodies, attachments, folder structure, created/modified timestamps, and note names (first line) into a target directory with `index.csv`, `notes/`, and `artifacts/`. Support folder include/exclude filters, created/modified before/after filters, and an include/exclude attachments flag (default include). Output mirrors the Notes folder structure: `notes/folder/sub/<note-id>.html` and `artifacts/folder/sub/<note-id>/<artifact-id>.<ext>`; `index.csv` columns: note id, note name, artifacts list, location, created at UTC, modified at UTC."

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

### User Story 1 - Export full library with structure (Priority: P1)

Mac user wants a full offline export of all Apple Notes into a folder they control, preserving folder hierarchy, note bodies, timestamps, and attachments.

**Why this priority**: Provides the core value of owning a portable dataset of all notes with provenance.

**Independent Test**: Run the CLI with a target directory and no filters; verify all notes appear in `index.csv`, HTML bodies mirror source notes, attachments are present, and folder structure matches Apple Notes.

**Acceptance Scenarios**:

1. **Given** Apple Notes installed with multiple folders and attachments, **When** the user runs the CLI pointing to an empty target directory without filters, **Then** `index.csv`, `notes/`, and `artifacts/` are created with one row per note and attachments saved in the mirrored folder/id paths.
2. **Given** an initial successful export, **When** the user re-runs the export without changing notes, **Then** the resulting files and `index.csv` content are identical to the prior run (byte-for-byte determinism).

---

### User Story 2 - Targeted export by folders and dates (Priority: P2)

Researcher wants to export only selected folders or a date-bounded subset to limit data volume.

**Why this priority**: Enables scoped datasets for sharing or analysis without leaking unrelated notes.

**Independent Test**: Run the CLI with include/exclude folder filters and created/modified before/after filters; verify only matching notes appear and others are absent.

**Acceptance Scenarios**:

1. **Given** folders A and B with overlapping note dates, **When** the user runs with `include folders=A` and `created_after` set to a timestamp, **Then** only notes in folder A newer than that timestamp appear in `index.csv` and exported files.
2. **Given** folders A and B, **When** the user runs with `exclude folders=B`, **Then** notes from B are absent from `index.csv`, `notes/`, and `artifacts/`.

---

### User Story 3 - Export without attachments (Priority: P3)

User wants a fast, text-only export with no artifacts to minimize disk usage.

**Why this priority**: Supports quick backups or compliance reviews where attachments are unnecessary.

**Independent Test**: Run the CLI with attachments disabled; confirm `artifacts/` is omitted or empty and `index.csv` lists empty artifact references.

**Acceptance Scenarios**:

1. **Given** notes with attachments, **When** the user runs the CLI with attachments excluded, **Then** `index.csv` rows exist for each note but artifact lists are empty and no files are written under `artifacts/`.

---

### Edge Cases

- Notes or attachments the user lacks permission to read.
- Notes with identical first lines (name collisions) or missing titles; ensure stable fallback naming via note id.
- Attachments with unsupported or unknown types; ensure they are still exported as raw files and recorded in `index.csv`.
- Very long or nested folder paths that could exceed filesystem path limits; ensure paths are sanitized without losing uniqueness.
- Notes modified during export; capture consistent snapshot or flag partial exports.
- Target directory is not empty: default behavior is to fail fast with a clear error and no writes. A `--force`-style flag may overwrite files, but only where collisions occur (never delete unrelated files).
- Long-running exports (e.g., ~1k notes) must emit periodic progress so users are not left waiting without feedback.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The CLI MUST require a user-specified target directory and create `index.csv`, `notes/`, and `artifacts/` within it, failing with a clear error if the path is invalid or lacks write permission.
- **FR-002**: The CLI MUST extract for each note: stable note identifier, note name (first line fallback to id), body content as HTML, folder path, created-at UTC, and modified-at UTC; filenames MUST use a collision-resistant, human-readable pattern such as `<sanitized-note-name>_<note-id>`.
- **FR-003**: The CLI MUST mirror the Apple Notes folder hierarchy under `notes/` with one HTML file per note at `notes/<folders>/<sanitized-note-name>_<note-id>.html`.
- **FR-004**: When attachments are included (default), the CLI MUST export each attachment as a raw file under `artifacts/<folders>/<sanitized-note-name>_<note-id>/<attachment-id>.<ext>` and reference all exported filenames for that note in `index.csv`.
- **FR-005**: When attachments are excluded, the CLI MUST skip creating attachment files and record an empty artifact list per note while still exporting note HTML and metadata.
- **FR-006**: The CLI MUST support filters: folders to include, folders to exclude, created-before, created-after, modified-before, and modified-after; notes failing filters MUST be omitted from `index.csv`, `notes/`, and `artifacts/`.
- **FR-007**: The CLI MUST produce `index.csv` rows in a deterministic order and format so repeated runs on unchanged data yield identical file content and artifact paths.
- **FR-008**: The CLI MUST operate entirely offline on the local macOS Notes data and avoid transmitting note content or metadata externally.
- **FR-009**: The CLI MUST surface structured, human-readable success and error messages including counts of exported notes and attachments, and explicitly flag skipped notes due to filters or access issues.
- **FR-010**: The CLI MUST provide concise, modern-looking progress feedback during export (e.g., note/attachment counts, elapsed time, current folder) with periodic updates so that long runs (≈1k notes) never remain silent for extended periods, while avoiding overly verbose output.

### Key Entities _(include if feature involves data)_

- **Note**: Source Apple Note with identifier, title (first line), body HTML, folder path, created-at UTC, modified-at UTC, and attachment references.
- **Attachment**: Raw file linked to a note, with attachment id, original filename or inferred extension, and stored path under `artifacts/`.
- **Folder**: Hierarchical path representing the note’s location in Apple Notes; used to mirror directory structures in exports.
- **Index Entry**: Row in `index.csv` capturing note id, note name, artifact filenames list, folder path, created-at UTC, and modified-at UTC.

### Assumptions

- Apple Notes exposes a stable per-note identifier suitable for filenames and cross-referencing attachments.
- Note bodies can be reliably converted to HTML for export without loss of visible content.
- Timestamps in Apple Notes can be normalized to UTC without ambiguity; local timezone is available for conversion.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Running the CLI with default options exports 100% of readable notes and attachments into the target directory with `index.csv` row count matching exported notes.
- **SC-002**: Two consecutive exports on unchanged data produce identical `index.csv` content and matching checksums for all generated files.
- **SC-003**: Applying folder or date filters reduces the exported set accordingly, with zero rows in `index.csv` for excluded folders/dates and no stray files under `notes/` or `artifacts/`.
- **SC-004**: Running with attachments disabled results in zero files under `artifacts/` and empty artifact lists in `index.csv` while still exporting all eligible note HTML files.
- **SC-005**: During an export of ~1k notes, users see periodic progress updates (at least every few seconds or every fixed batch of notes) plus a final summary with counts of exported and skipped notes/attachments and elapsed time.
