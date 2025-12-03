#!/usr/bin/env node
import os from "os";
import path from "path";
import { run } from "@jxa/run";
import fs from "fs/promises";

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-save-"));
  const info = await run((targetDir) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const withAtt = notes.find((n) => (n.attachments ? n.attachments().length > 0 : false));
    if (!withAtt) return { saved: false, reason: "no-attachments" };
    const att = withAtt.attachments()[0];
    const filePath = `${targetDir}/attachment`;
    try {
      att.save({ in: filePath });
      return { saved: true, filePath };
    } catch (error) {
      return { saved: false, error: error.toString() };
    }
  }, dir);
  let size = null;
  if (info.saved && info.filePath) {
    try {
      const stats = await fs.stat(info.filePath);
      size = stats.size;
    } catch (error) {}
  }
  console.log(JSON.stringify({ ...info, tempDir: dir, size }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
