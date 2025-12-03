#!/usr/bin/env node
import { run } from "@jxa/run";

const toArray = (collection) => {
  const result = [];
  if (!collection || typeof collection.length !== "number") return result;
  for (let i = 0; i < collection.length; i += 1) result.push(collection[i]);
  return result;
};

const maxNotes = Number.parseInt(process.env.MAX_NOTES ?? "200", 10);

const main = async () => {
  const notes = await run(() => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;

    const toArray = (collection) => {
      const result = [];
      if (!collection || typeof collection.length !== "number") return result;
      for (let i = 0; i < collection.length; i += 1) result.push(collection[i]);
      return result;
    };

    const readNote = (note, folderPath) => {
      let createdAt;
      let modifiedAt;
      try {
        createdAt = note.creationDate ? new Date(note.creationDate()).toISOString() : undefined;
      } catch (error) {}
      try {
        modifiedAt = note.modificationDate ? new Date(note.modificationDate()).toISOString() : undefined;
      } catch (error) {}

      let name;
      try {
        name = note.name ? note.name() : undefined;
      } catch (error) {}

      const attachments = [];
      try {
        const raw = toArray(note.attachments ? note.attachments() : []);
        for (let i = 0; i < raw.length; i += 1) {
          const att = raw[i];
          let attName;
          let attId;
          try {
            attName = att.name ? att.name() : undefined;
          } catch (error) {}
          try {
            attId =
              (att.id && att.id()) ||
              (att.uuid && att.uuid()) ||
              attName ||
              `att-${Math.random().toString(16).slice(2)}`;
          } catch (error) {}
          attachments.push({ id: String(attId), name: attName });
        }
      } catch (error) {}

      let id;
      try {
        id =
          (note.id && note.id()) ||
          (note.uuid && note.uuid()) ||
          name ||
          `note-${Math.random().toString(16).slice(2)}`;
      } catch (error) {}

      return {
        id: String(id),
        name: name || String(id),
        folderPath,
        createdAt,
        modifiedAt,
        attachmentsCount: attachments.length,
      };
    };

    const results = [];

    const traverseFolder = (folder, prefix) => {
      let folderName = "Notes";
      try {
        folderName = folder.name ? folder.name() : "Notes";
      } catch (error) {}
      const currentPath = prefix ? `${prefix}/${folderName}` : folderName;

      try {
        const notes = toArray(folder.notes ? folder.notes() : []);
        for (let i = 0; i < notes.length; i += 1) {
          results.push(readNote(notes[i], currentPath));
          if (results.length >= maxNotes) return;
        }
      } catch (error) {}

      try {
        const children = toArray(folder.folders ? folder.folders() : []);
        for (let i = 0; i < children.length; i += 1) {
          if (results.length >= maxNotes) return;
          traverseFolder(children[i], currentPath);
        }
      } catch (error) {}
    };

    try {
      const accounts = toArray(Notes.accounts ? Notes.accounts() : []);
      for (let i = 0; i < accounts.length; i += 1) {
        const accountFolders = toArray(accounts[i].folders ? accounts[i].folders() : []);
        for (let j = 0; j < accountFolders.length; j += 1) {
          traverseFolder(accountFolders[j], "");
          if (results.length >= maxNotes) break;
        }
        if (results.length >= maxNotes) break;
      }
    } catch (error) {}

    return results;
  });

  console.log(JSON.stringify({ count: notes.length, notes }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
