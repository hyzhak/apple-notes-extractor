#!/usr/bin/env node
import { run } from "@jxa/run";

const main = async () => {
  const info = await run(() => {
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
      if (!withAtt) return { found: false };
      const att = withAtt.attachments()[0];
      const keys = Object.keys(att);
      return { found: true, keys };
    } catch (error) {
      return { found: false, error: error.toString() };
    }
  });
  console.log(JSON.stringify(info, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
