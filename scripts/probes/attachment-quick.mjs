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
      const atts = withAtt.attachments();
      const att = atts && atts.length ? atts[0] : null;
      if (!att) return { found: false };
      let attId = null;
      let attName = null;
      let url = null;
      try {
        attId = att.id ? att.id() : att.uuid ? att.uuid() : null;
      } catch (error) {}
      try {
        attName = att.name ? att.name() : null;
      } catch (error) {}
      try {
        url = att.URL ? att.URL() : att.url ? att.url() : null;
      } catch (error) {}
      return { found: true, noteId: withAtt.id ? withAtt.id() : null, attId, attName, url };
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
