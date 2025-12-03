#!/usr/bin/env node
import { run } from "@jxa/run";

const LIMIT = Number.parseInt(process.env.LIMIT || "50", 10);

const main = async () => {
  const result = await run((limit) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const items = [];
    for (let i = 0; i < notes.length && items.length < limit; i += 1) {
      const n = notes[i];
      try {
        const body = n.body ? String(n.body()) : "";
        if (/cid:/i.test(body)) {
          items.push({
            idx: i,
            name: n.name ? n.name() : null,
            id: n.id ? n.id() : null,
            hasCid: true,
            bodyLen: body.length,
          });
        }
      } catch (error) {}
    }
    return { cidCount: items.length, sample: items };
  }, LIMIT);

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
