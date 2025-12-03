#!/usr/bin/env node
import os from "os";
import path from "path";
import fs from "fs/promises";
import { run } from "@jxa/run";

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-save-dir-"));
  const info = await run((targetDir) => {
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
      const atts = withAtt.attachments();
      const att = atts && atts.length ? atts[0] : null;
      if (!att) return { saved: false, reason: "no-attachment-instance" };
      const folder = `${targetDir}/export`;
      try {
        $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(
          folder,
          true,
          $(),
          null
        );
      } catch (error) {}
      try {
        att.save({ in: folder });
        return { saved: true, method: "save-dir", target: folder };
      } catch (error) {
        return { saved: false, error: error.toString(), method: "save-dir" };
      }
    } catch (error) {
      return { saved: false, error: error.toString(), method: "unknown" };
    }
  }, dir);

  let files = [];
  if (info.saved && info.target) {
    try {
      const names = await fs.readdir(info.target);
      for (const name of names) {
        const full = path.join(info.target, name);
        const stats = await fs.stat(full);
        files.push({ name, size: stats.size });
      }
    } catch (error) {}
  }

  console.log(JSON.stringify({ ...info, tempDir: dir, files }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
