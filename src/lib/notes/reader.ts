import { run } from '@jxa/run';
import { ensureMacOS, NotesBridgeError } from '../notes-bridge';
import type { Note } from '../../models/note';
import type { NotesReaderOptions, RawNoteResult, NotesApp } from './types';
import { normalizeNote } from './normalize';
import type { RunJxa } from './jxa-helpers';
import { debugLog } from './jxa-helpers';

declare function Application(name: string): unknown;

export async function getNoteCount(options: NotesReaderOptions = {}): Promise<number> {
  ensureMacOS();
  const runner: RunJxa = options.runJxa ?? run;
  try {
    const count = (await runner(() => {
      const Notes = Application('Notes') as NotesApp;
      const raw = typeof Notes.notes === 'function' ? Notes.notes() : [];
      const len = (raw as { length?: number }).length;
      return typeof len === 'number' && len >= 0 ? len : 0;
    })) as number;
    const safeCount = typeof count === 'number' && count >= 0 ? count : 0;
    debugLog('notes.count', { count: safeCount });
    return safeCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NotesBridgeError(`Failed to count notes: ${message}`);
  }
}

export async function readNoteByIndex(
  index: number,
  options: NotesReaderOptions = {}
): Promise<Note> {
  ensureMacOS();
  const runner: RunJxa = options.runJxa ?? run;
  try {
    const raw = (await runner((idx: number) => {
      const Notes = Application('Notes') as NotesApp;
      const notes = (typeof Notes.notes === 'function' ? Notes.notes() : []) as Array<{
        id?: () => unknown;
        uuid?: () => unknown;
        name?: () => unknown;
        body?: () => unknown;
        creationDate?: () => unknown;
        modificationDate?: () => unknown;
      }>;
      if (idx < 0 || idx >= notes.length) return null;
      const note = notes[idx];
      if (!note) return null;
      return {
        id:
          (typeof note.id === 'function' && note.id()) ||
          (typeof note.uuid === 'function' && note.uuid()) ||
          null,
        name: typeof note.name === 'function' ? note.name() : null,
        bodyHtml: typeof note.body === 'function' ? String(note.body()) : '',
        folderPath: 'Notes',
        createdAtUtc: typeof note.creationDate === 'function' ? note.creationDate() : null,
        modifiedAtUtc: typeof note.modificationDate === 'function' ? note.modificationDate() : null
      } satisfies RawNoteResult;
    }, index)) as RawNoteResult | null;

    if (!raw) {
      throw new NotesBridgeError(`Note at index ${index} not found.`);
    }

    const normalized = normalizeNote(raw, { folderPath: 'Notes' });
    debugLog('notes.read', { index, id: normalized.id, name: normalized.name });
    return normalized;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NotesBridgeError(`Failed to read note at index ${index}: ${message}`);
  }
}
