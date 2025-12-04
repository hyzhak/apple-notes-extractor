import path from 'node:path';
import type { Note } from '../models/note';

function sanitizeSegment(input: string): string {
  const trimmed = input.trim();
  const safe = trimmed
    .replace(/[\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
  return safe || 'note';
}

function slugifyNote(note: Pick<Note, 'name' | 'id'>): string {
  const namePart = sanitizeSegment(note.name);
  const idPart = sanitizeSegment(note.id);
  return `${namePart}_${idPart}`;
}

function normalizeFolderPath(folderPath: string): string {
  const parts = folderPath.split('/').filter(Boolean).map(sanitizeSegment);
  return parts.join('/');
}

export interface NotePathInfo {
  relativeHtmlPath: string;
  absoluteHtmlPath: string;
}

export function buildNotePath(note: Note, notesRoot: string): NotePathInfo {
  const folderRel = normalizeFolderPath(note.folderPath || 'Notes');
  const filename = `${slugifyNote(note)}.html`;
  const relativeHtmlPath = path.posix.join(folderRel, filename);
  const absoluteHtmlPath = path.join(notesRoot, relativeHtmlPath);
  return { relativeHtmlPath, absoluteHtmlPath };
}

export function defaultSlug(note: Pick<Note, 'name' | 'id'>): string {
  return slugifyNote(note);
}
