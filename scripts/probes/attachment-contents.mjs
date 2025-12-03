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
      if (!withAtt) return { found: false, reason: "no-attachments" };
      const atts = withAtt.attachments();
      const att = atts && atts.length ? atts[0] : null;
      if (!att) return { found: false, reason: "no-attachment-instance" };

      const result = {
        found: true,
        noteId: withAtt.id ? withAtt.id() : null,
        attId: att.id ? att.id() : null,
        name: att.name ? att.name() : null,
        hasURL: false,
        hasContents: false,
        hasData: false,
      };

      try {
        const url = att.URL ? att.URL() : att.url ? att.url() : null;
        result.hasURL = Boolean(url);
      } catch (error) {}

      try {
        const contents = att.contents ? att.contents() : att.content ? att.content() : null;
        result.hasContents = Boolean(contents);
      } catch (error) {}

      try {
        const data = att.data ? att.data() : null;
        result.hasData = Boolean(data);
      } catch (error) {}

      return result;
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
