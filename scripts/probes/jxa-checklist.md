# JXA Checklist (non-attachments)

- [x] Note fields: `id`/`name`/`body`/`creationDate`/`modificationDate` readable across many notes (`notes-multi-fields.mjs`).
- [x] Folder paths: traversal works; folderPath strings from folder names (`folder-paths.mjs`).
- [x] Plaintext vs HTML: `body()` longer/richer than `plaintext()`; use `body()` (`plaintext-vs-body.mjs`).
- [ ] Timestamps fallback: decide fallback if missing (not observed yet).
- [ ] Error handling: behavior on locked/password/unreadable notes (not tested; likely skip).
- [x] Determinism: two reads of `notes()` identical (`determinism-notes.mjs`).
- [x] Selection: `selection()` returns UI-selected notes; otherwise empty (not in current PRD).
- [ ] Timeout baseline: establish preferred timeout (reads 766 notes within ~1 min observed).
- [ ] Platform guard: add macOS check before running JXA in implementation.
- [x] Body cid: scanned first 200 notes, no `cid:` references found (`body-cid-scan.mjs`).
