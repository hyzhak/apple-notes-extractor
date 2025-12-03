#!/usr/bin/env node
import { run } from "@jxa/run";

const main = async () => {
  const info = await run(() => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;
    const notes = Notes.notes ? Notes.notes() : [];
    const first = notes.length ? notes[0] : null;
    const body = first && first.body ? first.body() : "";
    return { firstId: first ? (first.id ? first.id() : null) : null, bodyLength: body.length, hasCid: /cid:/i.test(body) };
  });
  console.log(JSON.stringify(info, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
