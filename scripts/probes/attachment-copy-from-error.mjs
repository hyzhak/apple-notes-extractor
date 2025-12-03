#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import os from "os";
import { run } from "@jxa/run";

const NOTE_INDEX = Number.parseInt(process.env.NOTE_INDEX || "10", 10);
const ATT_INDEX = Number.parseInt(process.env.ATT_INDEX || "0", 10);

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-copy-error-"));
  const target = path.join(dir, "attachment.bin");

  const info = await run((noteIndex, attIndex, targetPath) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    try {
      const notes = Notes.notes ? Notes.notes() : [];
      if (noteIndex >= notes.length) return { saved: false, reason: "note-index-out-of-range", notesLength: notes.length };
      const note = notes[noteIndex];
      const attachments = note.attachments ? note.attachments() : [];
      if (attIndex >= attachments.length) return { saved: false, reason: "attachment-index-out-of-range", attLength: attachments.length };
      const att = attachments[attIndex];
      try {
        Notes.save(att, { in: targetPath });
        return { saved: true, method: "save", target: targetPath };
      } catch (error) {
        const msg = error && error.toString ? error.toString() : String(error);
        const match = msg.match(/NSSourceFilePathErrorKey=([^,]+)/);
        return {
          saved: false,
          method: "save-error",
          error: msg,
          sourcePath: match ? match[1] : null,
          attachmentName: att.name ? att.name() : null,
        };
      }
    } catch (error) {
      return { saved: false, error: error.toString(), method: "exception" };
    }
  }, NOTE_INDEX, ATT_INDEX, target);

  let copyOk = false;
  let size = null;
  if (!info.saved && info.sourcePath) {
    try {
      await fs.copyFile(info.sourcePath, target);
      const stats = await fs.stat(target);
      size = stats.size;
      copyOk = true;
    } catch (error) {
      copyOk = false;
    }
  } else if (info.saved) {
    try {
      const stats = await fs.stat(target);
      size = stats.size;
    } catch (error) {}
  }

  console.log(
    JSON.stringify(
      {
        ...info,
        target,
        tempDir: dir,
        copyOk,
        size,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
