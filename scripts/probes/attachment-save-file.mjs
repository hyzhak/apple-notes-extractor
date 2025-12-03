#!/usr/bin/env node
import os from "os";
import path from "path";
import fs from "fs/promises";
import { run } from "@jxa/run";

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-save-file-"));
  const targetFile = path.join(dir, "attachment.bin");
  const info = await run((filePath) => {
    try {
      const Notes = Application("Notes");
      Notes.includeStandardAdditions = true;
      const notes = Notes.notes ? Notes.notes() : [];
      const withAtt = notes.find((n) => {
        try {
          return n.attachments && n.attachments().length > 0;
        } catch (error) {
          return false;
        }
      });
      if (!withAtt) return { saved: false, reason: "no-attachments" };
      const att = withAtt.attachments()[0];
      try {
        att.save({ in: filePath });
        return { saved: true, method: "save-file", target: filePath };
      } catch (error) {
        return { saved: false, error: error.toString(), method: "save-file" };
      }
    } catch (error) {
      return { saved: false, error: error.toString(), method: "save-file" };
    }
  }, targetFile);

  let size = null;
  if (info.saved && info.target) {
    try {
      const stats = await fs.stat(info.target);
      size = stats.size;
    } catch (error) {}
  }

  console.log(JSON.stringify({ ...info, tempDir: dir, size }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
