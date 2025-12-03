#!/usr/bin/env node
import os from "os";
import path from "path";
import fs from "fs/promises";
import { run } from "@jxa/run";

const TARGET_NAME = "IN PROGRESS: On-Policy Distillation"; // adjust if needed

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-save-native-"));
  const filePath = path.join(dir, "attachment.bin");

  const info = await run((targetName, targetPath) => {
    try {
      const Notes = Application("Notes");
      Notes.includeStandardAdditions = true;
      const notes = Notes.notes ? Notes.notes() : [];
      const match = notes.find((n) => {
        try {
          return n.name && n.name().includes(targetName);
        } catch (error) {
          return false;
        }
      });
      if (!match) return { saved: false, reason: "note-not-found" };
      const atts = match.attachments ? match.attachments() : [];
      if (!atts || !atts.length) return { saved: false, reason: "no-attachments" };
      const att = atts[0];

      try {
        att.save({ in: targetPath, as: "native format" });
        return { saved: true, method: "save-native", target: targetPath };
      } catch (error) {}

      try {
        const Path = typeof $ !== "undefined" ? $.NSString : null;
        if (Path) {
          att.save({ in: Path.stringWithString(targetPath), as: "native format" });
          return { saved: true, method: "save-native-nsstring", target: targetPath };
        }
      } catch (error) {}

      return { saved: false, reason: "save-failed" };
    } catch (error) {
      return { saved: false, error: error.toString() };
    }
  }, TARGET_NAME, filePath);

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
