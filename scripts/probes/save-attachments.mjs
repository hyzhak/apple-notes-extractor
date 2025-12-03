#!/usr/bin/env node
import fs from "fs/promises";
import os from "os";
import path from "path";
import { run } from "@jxa/run";

const toArray = (collection) => {
  const result = [];
  if (!collection || typeof collection.length !== "number") return result;
  for (let i = 0; i < collection.length; i += 1) result.push(collection[i]);
  return result;
};

const pickNoteWithAttachments = async () => {
  return run(() => {
    const Notes = Application("Notes");
    Notes.includeStandardAdditions = true;

    const toArray = (collection) => {
      const result = [];
      if (!collection || typeof collection.length !== "number") return result;
      for (let i = 0; i < collection.length; i += 1) result.push(collection[i]);
      return result;
    };

    const findNote = () => {
      const accounts = toArray(Notes.accounts ? Notes.accounts() : []);
      for (let i = 0; i < accounts.length; i += 1) {
        const folders = toArray(accounts[i].folders ? accounts[i].folders() : []);
        for (let j = 0; j < folders.length; j += 1) {
          const notes = toArray(folders[j].notes ? folders[j].notes() : []);
          for (let k = 0; k < notes.length; k += 1) {
            const note = notes[k];
            const rawAtts = toArray(note.attachments ? note.attachments() : []);
            if (rawAtts.length === 0) continue;
            let id;
            let name;
            try {
              id =
                (note.id && note.id()) ||
                (note.uuid && note.uuid()) ||
                (note.name && note.name()) ||
                `note-${Math.random().toString(16).slice(2)}`;
              name = note.name ? note.name() : String(id);
            } catch (error) {
              id = `note-${Math.random().toString(16).slice(2)}`;
              name = String(id);
            }
            return { id: String(id), name, attachments: rawAtts };
          }
        }
      }
      return null;
    };

    const selected = findNote();
    if (!selected) return null;

    const attachments = selected.attachments.map((att) => {
      let attName;
      let attId;
      let url;
      try {
        attName = att.name ? att.name() : undefined;
      } catch (error) {}
      try {
        url = att.URL ? att.URL() : att.url ? att.url() : undefined;
      } catch (error) {}
      try {
        attId =
          (att.id && att.id()) ||
          (att.uuid && att.uuid()) ||
          attName ||
          `att-${Math.random().toString(16).slice(2)}`;
      } catch (error) {}
      return { id: String(attId), name: attName, url, ref: att };
    });

    return { id: selected.id, name: selected.name, attachments };
  });
};

const saveAttachment = async (attachment, dir) => {
  const target = path.join(dir, `${attachment.id || "att"}`);
  const res = await run(
    (attRef, targetPath) => {
      try {
        if (typeof attRef.save === "function") {
          attRef.save({ in: targetPath });
          return { ok: true, method: "save" };
        }
      } catch (error) {}
      try {
        const url = attRef.URL ? attRef.URL() : attRef.url ? attRef.url() : undefined;
        if (url) {
          const nsUrl = $.NSURL.URLWithString(url);
          const data = $.NSData.dataWithContentsOfURL(nsUrl);
          if (data) {
            data.writeToFileAtomically(targetPath, true);
            return { ok: true, method: "url" };
          }
        }
      } catch (error) {}
      return { ok: false, method: null };
    },
    attachment.ref,
    target
  );
  return { target, ...res };
};

const main = async () => {
  const picked = await pickNoteWithAttachments();
  if (!picked) {
    console.error("No note with attachments found.");
    process.exitCode = 1;
    return;
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-att-"));
  const outcomes = [];

  for (const att of picked.attachments) {
    const outcome = await saveAttachment(att, dir);
    let size = null;
    try {
      const stats = await fs.stat(outcome.target);
      size = stats.size;
    } catch (error) {}
    outcomes.push({
      attachmentId: att.id,
      name: att.name,
      url: att.url,
      method: outcome.method,
      ok: outcome.ok,
      path: outcome.target,
      size,
    });
  }

  console.log(
    JSON.stringify(
      {
        noteId: picked.id,
        noteName: picked.name,
        tempDir: dir,
        outcomes,
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
