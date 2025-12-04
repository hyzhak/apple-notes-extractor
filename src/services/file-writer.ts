import fs from 'node:fs/promises';
import path from 'node:path';
import type { Note } from '../models/note';
import { buildNotePath, type NotePathInfo } from './pathing';

export type WriteNoteResult = NotePathInfo;

export async function writeNoteHtml(note: Note, notesRoot: string): Promise<WriteNoteResult> {
  const { absoluteHtmlPath, relativeHtmlPath } = buildNotePath(note, notesRoot);
  await fs.mkdir(path.dirname(absoluteHtmlPath), { recursive: true });
  await fs.writeFile(absoluteHtmlPath, note.bodyHtml, 'utf8');

  const created = new Date(note.createdAtUtc);
  const modified = new Date(note.modifiedAtUtc);
  const atime = Number.isNaN(created.getTime()) ? new Date() : created;
  const mtime = Number.isNaN(modified.getTime()) ? atime : modified;

  await fs.utimes(absoluteHtmlPath, atime, mtime);

  return { absoluteHtmlPath, relativeHtmlPath };
}
