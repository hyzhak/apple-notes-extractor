# Implementation Plan: Apple Notes Export CLI

**Branch**: `001-apple-notes-export` | **Date**: 2025-11-25 | **Spec**: specs/001-apple-notes-export/spec.md
**Input**: Feature specification from `/specs/001-apple-notes-export/spec.md`

## Summary

Build a macOS-only, TypeScript-based CLI (npm package) that exports Apple Notes to a local target directory with deterministic `index.json`, untouched HTML note bodies (no extra frontmatter), and raw attachments mirrored by folder structure. Note HTML files carry the source created/modified timestamps; `index.json` holds metadata only. The CLI must support include/exclude folder filters, timestamp filters, and optional attachment export. Project will be CLI-first, published to npm, and built/tested via GitHub Actions with automatic publish on tagged releases while preserving offline, deterministic behavior. Use modern Node/TS tooling (ESM, tsup bundling, commander+zod, structured logging) and `@jxa/run` to drive Notes access cleanly. Target Node.js 24.x LTS for runtime stability and downstream compatibility.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 24.x LTS (ESM)  
**Primary Dependencies**: commander (CLI), tsup (bundle), zod (arg/JSON schema validation), @jxa/run (AppleScript/JXA bridge to Notes), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format)  
**Storage**: Local filesystem outputs only (`index.json`, `notes/`, `artifacts/`), no external services  
**Testing**: vitest (unit/contract), snapshot/determinism tests, fixture-based file exports  
**Target Platform**: macOS Notes database (local), runs on macOS host CLI  
**Project Type**: CLI-first npm package with bin entry and optional library API  
**Performance Goals**: Deterministic export for ~1k notes with progress updates every few seconds/batches; avoid long silent periods; minimize extra copies of note data  
**Constraints**: Offline/local-only processing; deterministic ordering and filenames; test-first; semantic versioning aligned to export format compatibility; avoid path length issues via sanitization  
**Scale/Scope**: Personal/SMB libraries (hundreds to low-thousands notes, mixed attachments)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Local-first privacy: no network calls during extraction; store only in user target dir.
- Deterministic exports: stable ordering, filenames, and JSON structure; repeatable tests required.
- Test-first: add fixtures and failing tests before implementation; include determinism and CLI contract tests.
- CLI-first: provide human-readable and JSON output, dry-run, machine-friendly exit codes, `--help`.
- Observability: structured logging with note identifiers/paths, no content leakage, explicit partial failure reporting.
- SemVer & releases: breaking export format changes require major bump and migration notes.
- Current plan aligns; no violations expected.
- Post-design check: CI-driven npm publish on tags does not process user data and keeps extraction offline; still compliant.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── cli/                 # entrypoint, command wiring, option parsing
├── lib/                 # core export logic (notes reader, filters, progress, determinism)
├── models/              # entities and schemas (Note, Attachment, IndexEntry)
└── services/            # filesystem operations, sanitization, logging

tests/
├── unit/                # pure functions, sanitization, filters
├── integration/         # end-to-end export against fixtures, determinism checks
└── contract/            # CLI contract tests (text + JSON output, exit codes)
```

**Structure Decision**: Single TypeScript CLI package with bin entry, bundled via tsup; tests organized by unit/integration/contract as above.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
