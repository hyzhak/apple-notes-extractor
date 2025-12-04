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

- [ ] T010 Notes bridge with macOS guard using @jxa/run (`src/lib/notes-bridge.ts`)
- [ ] T011 CLI smoke path calls Notes to return note count + first note id/name/folder; writes summary JSON to target (replaces empty index)

---

## Phase 3 — Single Note Export Slice

Goal: Export first note’s HTML to target, capture created/modified times; smoke uses real Notes.

- [ ] T020 Models for Note/IndexEntry in `src/models/note.ts` (only fields needed for single-note export)
- [ ] T021 Path helper for deterministic slug + notes folder layout in `src/services/pathing.ts` (scoped to single-note use)
- [ ] T022 Single-note reader via JXA in `src/lib/notes-reader.ts` (first note only)
- [ ] T023 File writer to save one HTML with timestamps in `src/services/file-writer.ts`
- [ ] T024 CLI exports first note to `notes/` and `index.json` (single entry)
- [ ] T025 Smoke: rerun on same target (force) yields identical outputs

---

## Phase 4 — Full Notes Export (no filters, no attachments)

Goal: Export all notes with deterministic ordering and index; smoke uses real Notes library.

- [ ] T030 Expand reader to traverse all folders/notes deterministically (reuse probes ordering)
- [ ] T031 Planner to produce ordered work items in `src/lib/export-planner.ts`
- [ ] T032 Index writer for all notes in `src/lib/index-writer.ts`
- [ ] T033 Export runner orchestrating reader → planner → writer in `src/lib/export-runner.ts`
- [ ] T034 CLI default command runs full export to target; smoke validates rerun determinism
- [ ] T035 Unit fixtures (optional) for helpers only (pathing, sorting); no fixture-driven functional tests

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
