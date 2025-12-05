# Tasks: Apple Notes Export CLI (Walking Skeleton, Real Notes First)

**Input**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Discipline**: Vertical slices with real JXA Notes access in every functional slice. Smoke/contract must exercise real Notes (fixtures allowed only for unit-level helpers). No utilities without an immediate consumer.

## Phase 0 — Always-Runnable Smoke (done)

- [x] T000 Minimal CLI: validate target dir, write empty `index.json`, emit JSON summary (current smoke)

## Phase 1 — Tooling (done)

- [x] T001 Package metadata/bin/engines
- [x] T002 TS project refs + ESM settings
- [x] T003 [P] tsup bundle config
- [x] T004 [P] eslint/prettier configs
- [x] T005 [P] vitest config

---

## Phase 2 — JXA Handshake Slice (real Notes ping)

Goal: Smoke uses @jxa/run to talk to Notes and report counts; no fixtures.

- [x] T010 Notes bridge with macOS guard using @jxa/run (`src/lib/notes-bridge.ts`)
- [x] T011 CLI smoke path calls Notes to return note count + first note id/name/folder; writes summary JSON to target (replaces empty index)

---

## Phase 3 — Single Note Export Slice

Goal: Export first note’s HTML to target, capture created/modified times; smoke uses real Notes.

- [x] T020 Models for Note/IndexEntry in `src/models/note.ts` (only fields needed for single-note export)
- [x] T021 Path helper for deterministic slug + notes folder layout in `src/services/pathing.ts` (scoped to single-note use)
- [x] T022 Single-note reader via JXA in `src/lib/notes-reader.ts` (first note only)
- [x] T023 File writer to save one HTML with timestamps in `src/services/file-writer.ts`
- [x] T024 CLI exports first note to `notes/` and `index.json` (single entry)
- [x] T025 Smoke: rerun on same target (force) yields identical outputs

---

## Phase 4 — Full Notes Export (single-pass, simple loop)

Goal: Export all notes in one traversal, writing each note immediately (no double buffering); smoke uses real Notes.

- [x] T030 Get note count (JXA): minimal script returns `Notes.notes().length`; unit covers mock; log count.
- [x] T031 Single-note read by index (JXA): fetch id/name/body/created/modified; folderPath default 'Notes'; unit tests for missing id/body.
- [x] T032 Export loop: in `export-runner`, for i in 0..count-1 call read-by-index, write HTML, append index entry; no arrays of notes.
- [x] T033 Wire CLI to new loop; keep smoke summary; add debug logs for count and per-note.
- [ ] T034 Smoke determinism rerun on same target (force) yields identical outputs; fix any remaining errors.
- [ ] T035 Cleanup/lint/tests: remove unused helpers, ensure files stay small and readable.

---



## Phase 5 — Filters Slice A (Folders only, real Notes)

Goal: Include/exclude folders applied against live Notes; deterministic outputs.

- [ ] T040 Filter schema + parsing for folders in `src/lib/filter-schema.ts`
- [ ] T041 Apply folder filters in planner/reader flow in `src/lib/filtering.ts`
- [ ] T042 CLI options/help for folder filters in `src/cli/index.ts`
- [ ] T043 Smoke: run with include/exclude folders against live Notes; verify counts/index reflect filters

---

## Phase 6 — Filters Slice B (Date bounds, real Notes)

Goal: Created/modified date filters applied against live Notes; deterministic outputs.

- [ ] T044 Extend filter schema for date bounds in `src/lib/filter-schema.ts`
- [ ] T045 Apply date filters in planner/reader flow in `src/lib/filtering.ts`
- [ ] T046 CLI options/help for date filters in `src/cli/index.ts`
- [ ] T047 Smoke: run with date bounds against live Notes; verify counts/index reflect filters

---

## Phase 7 — Logging & Progress (only when visible in smoke)

- [ ] T060 Structured logging/progress reporter in `src/lib/progress-reporter.ts`
- [ ] T061 Surface progress in CLI output (rate-limited) and keep smoke green

---

## Phase 8 — Polish & Docs

- [ ] T070 Refresh README.md and `specs/001-apple-notes-export/quickstart.md` with real-notes examples
- [ ] T071 Determinism soak (long-run) against live library
- [ ] T072 CI/publish workflow in `.github/workflows/ci.yml`

---

## Execution rules

- Always keep smoke hitting real Notes; use fixtures only for unit-level helpers.
- Tests precede code for each slice; do not introduce unused scaffolding.
- Small steps: land one slice at a time, verifying determinism on reruns.
