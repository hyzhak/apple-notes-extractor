#!/usr/bin/env node
import os from "os";
import path from "path";
import fs from "fs/promises";
import { run } from "@jxa/run";

const TARGET_NAME = process.env.TARGET_NAME || "IN PROGRESS: On-Policy Distillation";

const main = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-save-errorcopy-"));
  const targetFile = path.join(dir, "attachment.bin");

  const info = await run((targetName, targetPath) => {
    try {
      const curApp = Application.currentApplication();
      curApp.includeStandardAdditions = true;
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
        Notes.save(att, { in: targetPath });
        return { saved: true, method: "save-direct", target: targetPath };
      } catch (error) {
        const msg = error && error.toString ? error.toString() : String(error);
        const matchPath = msg.match(/NSSourceFilePathErrorKey=([^,]+)/);
        return { saved: false, method: "error-copy", sourcePath: matchPath ? matchPath[1] : null, error: msg };
      }
    } catch (error) {
      return { saved: false, error: error.toString() };
    }
  }, TARGET_NAME, targetFile);

  let copyAttempted = false;
  let copyOk = false;
  let size = null;
  if (!info.saved && info.sourcePath) {
    copyAttempted = true;
    try {
      await fs.copyFile(info.sourcePath, targetFile);
      const stats = await fs.stat(targetFile);
      size = stats.size;
      copyOk = true;
    } catch (error) {
      copyOk = false;
    }
  } else if (info.saved && info.target) {
    try {
      const stats = await fs.stat(info.target);
      size = stats.size;
    } catch (error) {}
  }

  console.log(
    JSON.stringify(
      {
        ...info,
        tempDir: dir,
        copyAttempted,
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
