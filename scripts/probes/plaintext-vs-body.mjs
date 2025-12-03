#!/usr/bin/env node
import { run } from "@jxa/run";

const LIMIT = Number.parseInt(process.env.LIMIT || "10", 10);

const main = async () => {
  const result = await run((limit) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const items = [];
    for (let i = 0; i < notes.length && items.length < limit; i += 1) {
      const n = notes[i];
      try {
        const name = n.name ? n.name() : null;
        const body = n.body ? String(n.body()) : "";
        const plain = n.plaintext ? String(n.plaintext()) : "";
        items.push({
          idx: i,
          name,
          bodyLen: body.length,
          plainLen: plain.length,
          diff: body.length - plain.length,
        });
      } catch (error) {}
    }
    return { sample: items };
  }, LIMIT);

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
