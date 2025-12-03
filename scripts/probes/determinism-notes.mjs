#!/usr/bin/env node
import { run } from "@jxa/run";

const LIMIT = Number.parseInt(process.env.LIMIT || "1000", 10);

const main = async () => {
  const readOnce = async () =>
    run((limitVal) => {
      const Notes = Application("Notes");
      Notes.includeStandardAdditions = true;
      const notes = Notes.notes ? Notes.notes() : [];
      const ids = [];
      for (let i = 0; i < notes.length && ids.length < limitVal; i += 1) {
        try {
          const n = notes[i];
          const id = n.id ? n.id() : n.uuid ? n.uuid() : null;
          if (id) ids.push(String(id));
        } catch (error) {}
      }
      return ids;
    }, LIMIT);

  const a = await readOnce();
  const b = await readOnce();
  const same =
    a.length === b.length &&
    a.every((id, idx) => id === b[idx]);

  console.log(JSON.stringify({ lenA: a.length, lenB: b.length, same }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
