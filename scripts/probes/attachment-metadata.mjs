#!/usr/bin/env node
import { run } from "@jxa/run";

const TARGET_NAME = "IN PROGRESS: On-Policy Distillation"; // adjust if needed

const main = async () => {
  const info = await run((targetName) => {
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
      if (!match) return { found: false };
      const atts = match.attachments ? match.attachments() : [];
      if (!atts || !atts.length) return { found: false, reason: "no-attachments" };
      const att = atts[0];
      const safe = (fn) => {
        try {
          return fn();
        } catch (error) {
          return null;
        }
      };
      return {
        found: true,
        noteName: safe(() => match.name()),
        noteId: safe(() => match.id()),
        attId: safe(() => att.id()),
        attName: safe(() => att.name()),
        attURL: safe(() => (att.URL ? att.URL() : att.url ? att.url() : null)),
        contentIdentifier: safe(() => (att.contentIdentifier ? att.contentIdentifier() : null)),
        created: safe(() => (att.creationDate ? new Date(att.creationDate()).toISOString() : null)),
        modified: safe(() => (att.modificationDate ? new Date(att.modificationDate()).toISOString() : null)),
      };
    } catch (error) {
      return { found: false, error: error.toString() };
    }
  }, TARGET_NAME);

  console.log(JSON.stringify(info, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
