#!/usr/bin/env node
import { run } from "@jxa/run";

const QUERY = process.env.QUERY || "Episode 10";
const LIMIT = Number.parseInt(process.env.LIMIT || "10", 10);

const main = async () => {
  const result = await run((query, limit) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const matches = [];
    for (let i = 0; i < notes.length; i += 1) {
      const n = notes[i];
      try {
        const name = n.name ? n.name() : "";
        if (name.toLowerCase().includes(query.toLowerCase())) {
          matches.push(name);
          if (matches.length >= limit) break;
        }
      } catch (error) {}
    }
    return { count: matches.length, matches };
  }, QUERY, LIMIT);

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
