# Validation-First Plan (Apple Notes Export CLI)

**Branch**: `001-apple-notes-export`  
**Purpose**: Front-load JXA validation and smoke tests on real Apple Notes data before implementation. No assumptions without probes.

## Probes (validated in `scripts/probes/`)

- `notes-multi-fields.mjs`: enumerate notes; log `id`, `name`, `folderPath`, `created/modified`. Confirms root label and nested path building.
- `plaintext-vs-body.mjs`: fetch sample note body; confirmed `body()` richer than `plaintext()`.
- `attachment-save-errorcopy.mjs` / `attachment-copy-simple.mjs`: attempts show `attachment.save` failures; attachments deferred.
- `permissions/latency`: use `notes-multi-fields.mjs` timing as baseline; add guard for Automation permission.
- `determinism-notes.mjs`: minimal end-to-end read for determinism across runs.

_All probes run with `with_escalated_permissions` and target actual Apple Notes data._

## Validation Goals

1) **Notes listing**: stable `id/name/body/creationDate/modificationDate/folderPath` retrieval; confirm folder concatenation/root naming.  
2) **Body HTML**: verify `note.body()` structure; detect `cid:` references/inline assets; decide if plaintext needed (expected: no).  
3) **Attachments**: deferred. Probe result: `attachment.save` fails; need future path (e.g., copy from `NSSourceFilePathErrorKey`).  
4) **Permissions/timeouts**: ensure `@jxa/run` works from Node; measure latency; set default timeout.  
5) **Determinism**: two back-to-back exports identical (files + `index.json`); note any nondeterministic fields.

## Execution Order (validation-first)

1) Recreate scaffold (package.json, tsconfig, src layout) — stop before feature coding.  
2) Add probe scripts + npm scripts (`probe:*`, `smoke:export`).  
3) Run probes on real data; capture findings (success/fail, timings, determinism notes).  
4) Update data model/plan from probe results (attachment handling deferred, HTML nuances, timeouts).  
5) Build vertical-slice MVP exporter (notes-only); immediately run smoke export on real data after each increment.  
6) Then add fixtures/tests and proceed US1 → US2 → US3, keeping smoke checks in the loop.

## Notes

- Use a dedicated temp directory for probes/exports; clean between runs.  
- Record probe outputs (success/failure + timing) to guide implementation choices.  
- Do not proceed to full implementation until probes pass and behaviors are understood.
