#!/usr/bin/env node
import { run } from "@jxa/run";

const LIMIT = Number.parseInt(process.env.LIMIT || "20", 10);

const main = async () => {
  const result = await run((limit) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const items = [];
    for (let i = 0; i < notes.length && items.length < limit; i += 1) {
      const n = notes[i];
      const safe = (fn) => {
        try {
          return fn();
        } catch (error) {
          return null;
        }
      };
      items.push({
        idx: i,
        id: safe(() => n.id ? n.id() : n.uuid ? n.uuid() : null),
        name: safe(() => n.name ? n.name() : null),
        bodyLen: safe(() => (n.body ? String(n.body()).length : 0)),
        created: safe(() => (n.creationDate ? new Date(n.creationDate()).toISOString() : null)),
        modified: safe(() => (n.modificationDate ? new Date(n.modificationDate()).toISOString() : null)),
      });
    }
    return { total: notes.length, sample: items };
  }, LIMIT);

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
