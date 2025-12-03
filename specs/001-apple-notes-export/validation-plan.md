# Validation-First Plan (Apple Notes Export CLI)

**Branch**: `001-apple-notes-export`  
**Purpose**: Front-load JXA validation and smoke tests on real Apple Notes data before implementation. No assumptions without probes.

## Probes to Add (`scripts/probes/`)

- `list-notes.ts`: enumerate accounts → folders → notes; log `id`, `name`, `folderPath`, `created/modified`, attachment count. Confirms root label (“Notes” vs account name) and nested path building.
- `inspect-body.ts`: fetch a sample note body; log presence of `cid:` refs/inline assets, HTML shape, and any anomalies.
- `save-attachments.ts`: for a chosen note, attempt `attachment.save({ in: tempPath })`; log `id`, `name`, inferred `ext`, success/failure, size. Fallback to `attachment.URL()` only if save fails.
- `permissions-check.ts`: minimal Notes ping to detect Automation permission state and measure latency; tunes bridge timeout.
- `smoke-export.ts`: minimal end-to-end export to a temp dir (notes + attachments). Run twice to compare byte-for-byte for determinism.

_All probes run with `with_escalated_permissions` and target actual Apple Notes data._

## Validation Goals

1) **Notes listing**: stable `id/name/body/creationDate/modificationDate/folderPath` retrieval; confirm folder concatenation/root naming.  
2) **Body HTML**: verify `note.body()` structure; detect `cid:` references/inline assets; decide if plaintext needed (expected: no).  
3) **Attachments**: confirm `attachment.save({ in: ... })` works for images/PDF/misc; capture when `URL` is required; get stable `id/name/ext`.  
4) **Permissions/timeouts**: ensure `@jxa/run` works from Node; measure latency; set default timeout.  
5) **Determinism**: two back-to-back exports identical (files + `index.json`); note any nondeterministic fields.

## Execution Order (validation-first)

1) Recreate scaffold (package.json, tsconfig, src layout) — stop before feature coding.  
2) Add probe scripts + npm scripts (`probe:*`, `smoke:export`).  
3) Run probes on real data; capture findings (success/fail, timings, determinism notes).  
4) Update data model/plan from probe results (attachment handling, HTML nuances, timeouts).  
5) Build vertical-slice MVP exporter; immediately run smoke export on real data.  
6) Then add fixtures/tests and proceed US1 → US2 → US3, keeping smoke checks in the loop.

## Notes

- Use a dedicated temp directory for probes/exports; clean between runs.  
- Record probe outputs (success/failure + timing) to guide implementation choices.  
- Do not proceed to full implementation until probes pass and behaviors are understood.
