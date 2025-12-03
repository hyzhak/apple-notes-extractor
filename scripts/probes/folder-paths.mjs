#!/usr/bin/env node
import { run } from "@jxa/run";

const LIMIT = Number.parseInt(process.env.LIMIT || "20", 10);

const main = async () => {
  const result = await run((limit) => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;

    const toArray = (collection) => {
      const res = [];
      if (!collection || typeof collection.length !== "number") return res;
      for (let i = 0; i < collection.length; i += 1) res.push(collection[i]);
      return res;
    };

    const items = [];
    const walkFolder = (folder, prefix) => {
      let name = "Notes";
      try {
        name = folder.name ? folder.name() : "Notes";
      } catch (error) {}
      const current = prefix ? `${prefix}/${name}` : name;
      try {
        const notes = toArray(folder.notes ? folder.notes() : []);
        for (let i = 0; i < notes.length && items.length < limit; i += 1) {
          const n = notes[i];
          items.push({
            folderPath: current,
            noteName: n.name ? n.name() : null,
          });
          if (items.length >= limit) return;
        }
      } catch (error) {}
      try {
        const subs = toArray(folder.folders ? folder.folders() : []);
        for (let i = 0; i < subs.length && items.length < limit; i += 1) {
          walkFolder(subs[i], current);
        }
      } catch (error) {}
    };

    try {
      const accounts = toArray(Notes.accounts ? Notes.accounts() : []);
      for (let i = 0; i < accounts.length && items.length < limit; i += 1) {
        const accountFolders = toArray(accounts[i].folders ? accounts[i].folders() : []);
        for (let j = 0; j < accountFolders.length && items.length < limit; j += 1) {
          walkFolder(accountFolders[j], "");
        }
      }
    } catch (error) {}

    return { sampleCount: items.length, sample: items };
  }, LIMIT);

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
