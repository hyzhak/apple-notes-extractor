# JXA Probe Snippets (Apple Notes)

Purpose: keep tiny, validated snippets for Apple Notes JXA access. Run with `with_escalated_permissions`. Node runtime currently v22.16.0.

## Findings so far

- Permissions: Notes responds; latency ~68 ms (`permissions-check`).
- Notes count: ~766 notes; first note has body length ~3.9k, no `cid:` found in that sample (`list-notes-quick`, `body-quick`).
- Attachments: Found note `x-coredata://...p4676` with attachment `x-coredata://...p4677`, name `#225 - GPT 5.1, Kimi K2 Thinking, Remote Labor Index`; `URL` is null (`attachment-quick`).
- Attachment save attempts (`att.save({ in: filePath })`, `{ in: folder }`, explicit file path) all fail with “AppleEvent handler failed.” No files created (`save-quick`, `attachment-save-dir`, `attachment-save-file`).
- Attachment properties: `URL`/`contents`/`data` not exposed on tested items; `Object.keys(att)` empty. Metadata can include `contentIdentifier` + timestamps.
- `Notes.save` fails, but error contains `NSSourceFilePathErrorKey` pointing to real file under `~/Library/Group Containers/group.com.apple.notes/Media/...`; must copy manually from that path (dest perms may still block without Full Disk Access).
- Reference: repo https://github.com/abruneau/apple-notes-jxa uses `Notes.notes()` and exposes only note fields (no attachment handling). Attachment-specific handling not present there.
- Reference: https://bru6.de/jxa/automating-applications/notes/ shows a fallback: when `Notes.save(attachment, { in: target })` fails with “Operation not permitted”, parse `NSSourceFilePathErrorKey` from the error and copy that source path to the target with a shell `cp` (requires Full Disk Access for the shell).
- Note selection: `Notes.selection()` works when items are selected in the Notes UI (e.g., selectionCount=6, allCount=766); otherwise returns empty. Not used in current PRD.

## Scripts

- `permissions-check.mjs`: minimal ping to Notes (running/appName).
- `list-notes-quick.mjs`: Notes.notes() count + first note id/name.
- `body-quick.mjs`: body length and `cid:` detection for first note.
- `attachment-quick.mjs`: locate first note with attachments; log ids/name/url.
- `save-quick.mjs`: attempt `att.save({ in: <tmp>/attachment })`; currently failing.
- `attachment-save-dir.mjs`: attempt `att.save` into a directory; fails.
- `attachment-save-file.mjs`: attempt `att.save` to explicit file with extension; fails.
- `attachment-contents.mjs`: check `URL`, `contents/content/data` presence; all false on tested attachment.
- `attachment-keys.mjs`: enumerate attachment object keys; returns empty array.
- `attachment-metadata.mjs`: logs id/name/url/contentIdentifier/created/modified for a named note’s first attachment.
- `attachment-save-native.mjs`: attempts `att.save` with `as: "native format"` (and NSString fallback); fails on tested attachment.
- `attachment-save-errorcopy.mjs` / `attachment-copy-simple.mjs`: attempts save; on failure returns `NSSourceFilePathErrorKey` for manual copy; automatic copy can be blocked by dest perms.
- `note-search.mjs`: find note names containing a query substring (case-insensitive).
- `url-note-body.mjs`: fetch body + first link + attachment URL for a note name substring (normalizes by stripping non-alphanumerics).
- `notes-multi-fields.mjs`: sample id/name/bodyLen/created/modified across multiple notes.
- `folder-paths.mjs`: traverse accounts/folders/subfolders, emits folderPath + noteName sample.
- `plaintext-vs-body.mjs`: compare `body()` vs `plaintext()` lengths.
- `determinism-notes.mjs`: read notes twice, compare order/ids (deterministic in our run).
- `body-cid-scan.mjs`: scan note bodies for `cid:` references (none found in first 200 notes).
- Selection probe (inline one-liner): reports selection count/name; use only if leveraging UI selection.

## Next probes (planned)

- Try other attachment types (image/PDF) to see if `save` works there.
- Probe attachment metadata: `creationDate`, `modificationDate`, `contentIdentifier`.
- Enumerate folder hierarchy to confirm root naming and nested paths.

Keep snippets under ~10–20 lines each; validate incrementally and record outcomes here.
