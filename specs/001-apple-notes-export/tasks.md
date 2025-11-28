# Tasks: Apple Notes Export CLI

**Input**: Design documents from `/specs/001-apple-notes-export/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize tooling and project scaffolding for TypeScript 5.x on Node 24.x LTS (ESM)

- [ ] T001 Add package metadata, `bin` entry, and Node 24.x engines field in `package.json`
- [ ] T002 Configure TypeScript project refs and ESM settings in `tsconfig.json`
- [ ] T003 [P] Add tsup bundle config for CLI + library outputs in `tsup.config.ts`
- [ ] T004 [P] Configure eslint/prettier rules for ESM TypeScript in `.eslintrc.*` and `.prettierrc.*`
- [ ] T005 [P] Add vitest setup (ts-node resolver, coverage, snapshot dirs) in `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core scaffolding and shared utilities required before user stories

- [ ] T006 Create source tree stubs (`src/cli/`, `src/lib/`, `src/models/`, `src/services/`) with index exports in `src/index.ts`
- [ ] T007 Define Note/Attachment/IndexEntry schemas and types in `src/models/note.ts`
- [ ] T008 [P] Implement deterministic slug/path helpers for notes and artifacts in `src/services/pathing.ts`
- [ ] T009 [P] Add structured logging and progress utilities in `src/services/logging.ts`
- [ ] T010 Implement macOS guard and Notes JXA bridge wrapper in `src/lib/notes-bridge.ts`
- [ ] T011 Define export configuration + target directory validation (empty or force) in `src/lib/export-context.ts`

---

## Phase 3: User Story 1 - Export full library with structure (Priority: P1) 🎯 MVP

**Goal**: Full offline export of all Apple Notes with folder mirroring, HTML bodies, timestamps, and attachments

**Independent Test**: Run CLI with only `--target` on fixtures; verify `index.json`, `notes/`, and `artifacts/` match source and rerun is deterministic.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add full-library fixtures with notes + attachments in `tests/fixtures/full-library/`
- [ ] T013 [P] [US1] Write CLI contract test for default export in `tests/contract/cli-full-export.spec.ts`
- [ ] T014 [P] [US1] Add integration test for deterministic re-run outputs in `tests/integration/export-determinism.spec.ts`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement Notes reader via `@jxa/run` mapping to models in `src/lib/notes-reader.ts`
- [ ] T016 [P] [US1] Build export planner producing ordered work items in `src/lib/export-planner.ts`
- [ ] T017 [P] [US1] Implement file writer for notes/attachments with timestamp preservation in `src/services/file-writer.ts`
- [ ] T018 [US1] Wire commander CLI with zod validation for base options in `src/cli/index.ts`
- [ ] T019 [US1] Add progress reporter and structured summaries in `src/lib/progress-reporter.ts`
- [ ] T020 [US1] Write deterministic `index.json` generator in `src/lib/index-writer.ts`
- [ ] T021 [US1] Orchestrate export flow (planner → writer → summaries) in `src/lib/export-runner.ts`

**Checkpoint**: Full export with attachments works and is deterministic

---

## Phase 4: User Story 2 - Targeted export by folders and dates (Priority: P2)

**Goal**: Export only selected folders or date-bounded notes

**Independent Test**: Run CLI with include/exclude folders and date bounds; only matching notes appear in outputs.

### Tests for User Story 2

- [ ] T022 [P] [US2] Extend fixtures with folder/date coverage in `tests/fixtures/filters/`
- [ ] T023 [P] [US2] Add CLI contract test for include/exclude folders in `tests/contract/cli-filters.spec.ts`
- [ ] T024 [P] [US2] Add integration test for created/modified date filters in `tests/integration/export-date-filters.spec.ts`

### Implementation for User Story 2

- [ ] T025 [P] [US2] Implement filter option schemas and parsing in `src/lib/filter-schema.ts`
- [ ] T026 [US2] Apply folder/date filters in planner/reader flow in `src/lib/filtering.ts`
- [ ] T027 [US2] Extend CLI options and help for filters in `src/cli/index.ts`
- [ ] T028 [US2] Report skipped counts due to filters in `src/lib/progress-reporter.ts`

**Checkpoint**: Filtered exports work independently with accurate omissions

---

## Phase 5: User Story 3 - Export without attachments (Priority: P3)

**Goal**: Fast text-only export that omits artifacts

**Independent Test**: Run CLI with attachments disabled; `artifacts/` absent or empty and index artifact arrays empty.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add fixtures for notes with attachments to skip in `tests/fixtures/no-attachments/`
- [ ] T030 [P] [US3] Write CLI contract test for `--attachments=false` in `tests/contract/cli-no-attachments.spec.ts`
- [ ] T031 [P] [US3] Add integration test ensuring artifact directories are not written in `tests/integration/export-no-attachments.spec.ts`

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implement attachment exclusion branch in export runner in `src/lib/export-runner.ts`
- [ ] T033 [US3] Ensure index writer emits empty artifact arrays when skipping attachments in `src/lib/index-writer.ts`
- [ ] T034 [US3] Update CLI defaults/help for attachment toggle in `src/cli/index.ts`

**Checkpoint**: Text-only export works independently with correct index metadata

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and documentation across stories

- [ ] T035 [P] Refresh README.md and `specs/001-apple-notes-export/quickstart.md` with final CLI examples
- [ ] T036 [P] Add long-run determinism soak test against fixtures in `tests/integration/determinism-soak.spec.ts`
- [ ] T037 Finalize CI/publish workflow for lint/test/build/tag publish in `.github/workflows/ci.yml`

---

## Dependencies & Execution Order

- Phases: Setup → Foundational → US1 (P1) → US2 (P2) → US3 (P3) → Polish
- User stories are independent after Foundational; US1 delivers MVP and is prerequisite for sequencing
- Tests within each story should precede implementation tasks; [P] tasks can run concurrently when files differ

## Parallel Execution Examples

- US1: Run T012, T013, T014 in parallel; implement T015, T016, T017 concurrently before wiring T018–T021
- US2: Parallelize T022–T024 fixture/tests while T025 builds schemas
- US3: Parallelize T029–T031 while T032 adjusts runner; sequence T033–T034 after runner changes

## Implementation Strategy

- MVP: Complete Setup → Foundational → US1, validate deterministic full export, then decide on release
- Incremental: After MVP, deliver US2 filters, validate independently, then US3 attachment toggle
- Maintain determinism gates: ensure every new path/filter respects ordering and stable filenames before merge
