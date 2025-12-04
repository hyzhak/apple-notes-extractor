import { run } from '@jxa/run';
import type { Note } from '../models/note';
import { ensureMacOS, NotesBridgeError } from './notes-bridge';

// Provided by macOS JavaScript for Automation runtime.
declare function Application(name: string): any;

type RunJxa = (fn: (...args: any[]) => any, ...args: any[]) => Promise<any>;

type JXANote = {
  id?: () => unknown;
  uuid?: () => unknown;
  name?: () => unknown;
  body?: () => unknown;
  creationDate?: () => unknown;
  modificationDate?: () => unknown;
};

type JXAFolder = {
  name?: () => unknown;
  notes?: () => unknown;
  folders?: () => unknown;
};

type JXAAccount = {
  folders?: () => unknown;
};

interface RawNoteResult {
  id: unknown;
  name: unknown;
  bodyHtml: unknown;
  folderPath: unknown;
  createdAtUtc: unknown;
  modifiedAtUtc: unknown;
}

export interface NotesReaderOptions {
  runJxa?: RunJxa;
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  return null;
}

function coerceString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function mapRawToNote(raw: RawNoteResult | null): Note {
  if (!raw) {
    throw new NotesBridgeError('No notes found in Apple Notes library.');
  }

  const id = coerceString(raw.id);
  const name = coerceString(raw.name);
  const bodyHtml = coerceString(raw.bodyHtml) ?? '';
  const folderPath = coerceString(raw.folderPath) ?? 'Notes';
  const createdAtUtc = toIsoString(raw.createdAtUtc);
  const modifiedAtUtc = toIsoString(raw.modifiedAtUtc);

  if (!id) {
    throw new NotesBridgeError('Apple Notes returned a note without an id.');
  }

  return {
    id,
    name: name ?? id,
    bodyHtml,
    folderPath,
    createdAtUtc: createdAtUtc ?? new Date().toISOString(),
    modifiedAtUtc: modifiedAtUtc ?? createdAtUtc ?? new Date().toISOString(),
    attachments: []
  };
}

export async function readFirstNote(options: NotesReaderOptions = {}): Promise<Note> {
  ensureMacOS();
  const runJxa = options.runJxa ?? run;

  try {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const result = (await runJxa(() => {
      const Notes = Application('Notes');
      Notes.includeStandardAdditions = true;

      const toArray = <T>(collection: unknown): T[] => {
        const res: T[] = [];
        if (!collection || typeof (collection as { length?: number }).length !== 'number') return res;
        const iterable = collection as { length: number; [index: number]: unknown };
        for (let i = 0; i < iterable.length; i += 1) {
          res.push(iterable[i] as T);
        }
        return res;
      };

      const safe = <T>(fn: () => T): T | null => {
        try {
          return fn();
        } catch {
          return null;
        }
      };

      const accounts = toArray<JXAAccount>(
        safe(() => (typeof Notes.accounts === 'function' ? Notes.accounts() : []))
      );

      let found: RawNoteResult | null = null;

      const buildNote = (note: JXANote, folderPath: string): RawNoteResult => {
        return {
          id: safe(() => (typeof note.id === 'function' ? note.id() : note.uuid ? note.uuid() : null)),
          name: safe(() => (typeof note.name === 'function' ? note.name() : null)),
          bodyHtml: safe(() => (typeof note.body === 'function' ? String(note.body()) : '')),
          folderPath,
          createdAtUtc: safe(() => (typeof note.creationDate === 'function' ? note.creationDate() : null)),
          modifiedAtUtc: safe(() =>
            typeof note.modificationDate === 'function' ? note.modificationDate() : null
          )
        };
      };

      const walkFolder = (folder: JXAFolder, prefix: string): void => {
        const folderName =
          safe(() => (typeof folder.name === 'function' ? String(folder.name()) : 'Notes')) || 'Notes';
        const current = prefix ? `${prefix}/${folderName}` : folderName;

        const notes = toArray<JXANote>(
          safe(() => (typeof folder.notes === 'function' ? folder.notes() : []))
        );
        if (notes.length > 0) {
          found = buildNote(notes[0], current);
          return;
        }

        const subfolders = toArray<JXAFolder>(
          safe(() => (typeof folder.folders === 'function' ? folder.folders() : []))
        );
        for (let i = 0; i < subfolders.length && !found; i += 1) {
          walkFolder(subfolders[i], current);
        }
      };

      for (let i = 0; i < accounts.length && !found; i += 1) {
        const account = accounts[i];
        const folders = toArray<JXAFolder>(
          safe(() => (account && typeof account.folders === 'function' ? account.folders() : []))
        );
        for (let j = 0; j < folders.length && !found; j += 1) {
          walkFolder(folders[j], '');
        }
      }

      if (!found) {
        const notes = toArray<JXANote>(
          safe(() => (typeof Notes.notes === 'function' ? Notes.notes() : []))
        );
        if (notes.length > 0) {
          found = buildNote(notes[0], 'Notes');
        }
      }

      return found;
    })) as RawNoteResult | null;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

    return mapRawToNote(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NotesBridgeError(`Failed to read first note: ${message}`);
  }
}
