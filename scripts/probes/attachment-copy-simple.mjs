#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import os from "os";
import { run } from "@jxa/run";

const NOTE_INDEX = Number.parseInt(process.env.NOTE_INDEX || "10", 10);
const ATT_INDEX = Number.parseInt(process.env.ATT_INDEX || "1", 10);

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-copy-simple-"));
  const target = path.join(dir, "attachment.bin");

  const info = await run((noteIndex, attIndex, targetPath) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    try {
      const notes = Notes.notes ? Notes.notes() : [];
      if (noteIndex >= notes.length) return { ok: false, reason: "note-index-out-of-range", notesLength: notes.length };
      const note = notes[noteIndex];
      const atts = note.attachments ? note.attachments() : [];
      if (attIndex >= atts.length) return { ok: false, reason: "attachment-index-out-of-range", attLength: atts.length };
      const att = atts[attIndex];
      try {
        Notes.save(att, { in: targetPath });
        return { ok: true, method: "save", targetPath };
      } catch (error) {
        const msg = error && error.toString ? error.toString() : String(error);
        const match = msg.match(/NSSourceFilePathErrorKey=([^,]+)/);
        return {
          ok: false,
          method: "save-error",
          error: msg,
          sourcePath: match ? match[1] : null,
          attachmentName: att.name ? att.name() : null,
        };
      }
    } catch (error) {
      return { ok: false, error: error.toString(), method: "exception" };
    }
  }, NOTE_INDEX, ATT_INDEX, target);

  let copyOk = false;
  let size = null;
  if (!info.ok && info.sourcePath) {
    try {
      await fs.copyFile(info.sourcePath, target);
      const stats = await fs.stat(target);
      size = stats.size;
      copyOk = true;
    } catch (error) {
      copyOk = false;
    }
  } else if (info.ok) {
    try {
      const stats = await fs.stat(target);
      size = stats.size;
    } catch (error) {}
  }

  console.log(JSON.stringify({ ...info, target, tempDir: dir, copyOk, size }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
