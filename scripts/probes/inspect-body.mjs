#!/usr/bin/env node
import { run } from "@jxa/run";

const main = async () => {
  const result = await run(() => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;

    const toArray = (collection) => {
      const result = [];
      if (!collection || typeof collection.length !== "number") return result;
      for (let i = 0; i < collection.length; i += 1) result.push(collection[i]);
      return result;
    };

    const firstNoteWithBody = () => {
      try {
        const accounts = toArray(Notes.accounts ? Notes.accounts() : []);
        for (let i = 0; i < accounts.length; i += 1) {
          const folders = toArray(accounts[i].folders ? accounts[i].folders() : []);
          for (let j = 0; j < folders.length; j += 1) {
            const notes = toArray(folders[j].notes ? folders[j].notes() : []);
            if (notes.length > 0) {
              const note = notes[0];
              const id =
                (note.id && note.id()) ||
                (note.uuid && note.uuid()) ||
                (note.name && note.name()) ||
                `note-${Math.random().toString(16).slice(2)}`;
              const name = note.name ? note.name() : String(id);
              const body = note.body ? note.body() : "";
              return { id: String(id), name, body };
            }
          }
        }
      } catch (error) {}
      return null;
    };

    return firstNoteWithBody();
  });

  if (!result) {
    console.error("No note with body found.");
    process.exitCode = 1;
    return;
  }

  const hasCid = /cid:/i.test(result.body || "");
  const bodyLength = (result.body || "").length;

  console.log(
    JSON.stringify(
      {
        id: result.id,
        name: result.name,
        bodyLength,
        hasCid,
        sample: result.body?.slice(0, 500) ?? "",
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
