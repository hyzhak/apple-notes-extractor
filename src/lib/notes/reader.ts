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
      const length = (raw as { length?: number }).length;
      return typeof length === 'number' && length >= 0 ? length : 0;
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
        container?: () => unknown;
        creationDate?: () => unknown;
        modificationDate?: () => unknown;
      }>;

      const inRange = idx >= 0 && idx < (notes as { length: number }).length;
      if (!inRange) return null;

      const note = notes[idx];
      if (!note) return null;

      const callMethod = <T>(target: unknown, method: string): T | null => {
        if (!target || typeof (target as Record<string, unknown>)[method] !== 'function') {
          return null;
        }
        try {
          return (target as { [key: string]: () => T })[method]();
        } catch {
          return null;
        }
      };

      const containerPath = (): string => {
        const names: string[] = [];
        let current = callMethod<unknown>(note, 'container');
        while (current) {
          const containerName = callMethod<string>(current, 'name');
          if (typeof containerName === 'string' && containerName.trim().length > 0) {
            names.push(containerName);
          }
          current = callMethod<unknown>(current, 'container');
        }
        return names.length ? names.reverse().join('/') : 'Notes';
      };

      return {
        id: callMethod(note, 'id') ?? callMethod(note, 'uuid'),
        name: callMethod(note, 'name'),
        bodyHtml: callMethod(note, 'body'),
        folderPath: containerPath(),
        createdAtUtc: callMethod(note, 'creationDate'),
        modifiedAtUtc: callMethod(note, 'modificationDate')
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
