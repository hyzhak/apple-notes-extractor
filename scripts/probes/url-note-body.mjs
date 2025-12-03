#!/usr/bin/env node
import { run } from "@jxa/run";

const TARGET_NAME = process.env.TARGET_NAME || "URL shared"; // adjust if needed

const main = async () => {
  const info = await run((targetName) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNorm = norm(targetName);
    const match = notes.find((n) => {
      try {
        const name = n.name ? n.name() : "";
        return norm(name).includes(targetNorm);
      } catch (error) {
        return false;
      }
    });
    if (!match) return { found: false };
    const body = match.body ? match.body() : "";
    const url = match.url ? match.url() : null;
    const firstLink = (() => {
      const m = body.match(/href="([^"]+)"/i);
      return m ? m[1] : null;
    })();
    let attUrl = null;
    try {
      const atts = match.attachments ? match.attachments() : [];
      if (atts && atts.length > 0) {
        const att = atts[0];
        attUrl = att.URL ? att.URL() : att.url ? att.url() : null;
      }
    } catch (error) {}
    return {
      found: true,
      noteName: match.name ? match.name() : null,
      bodyLength: body.length,
      firstLink,
      noteUrlProp: url,
      attUrl,
    };
  }, TARGET_NAME);

  console.log(JSON.stringify(info, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
