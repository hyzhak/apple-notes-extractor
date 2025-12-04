import { run } from '@jxa/run';

// Provided by macOS JavaScript for Automation runtime.
declare function Application(name: string): any;

export interface NotePreview {
  id: string | null;
  name: string | null;
  folderPath: string | null;
}

export interface NotesSummary {
  totalNotes: number;
  firstNote: NotePreview | null;
}

interface RawNotesResult {
  totalNotes: unknown;
  firstNote: unknown;
}

export class MacOSUnsupportedError extends Error {
  constructor(message = 'Apple Notes export requires macOS.') {
    super(message);
    this.name = 'MacOSUnsupportedError';
  }
}

export class NotesBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotesBridgeError';
  }
}

type RunJxa = (fn: (...args: any[]) => any, ...args: any[]) => Promise<any>;

export interface FetchNotesSummaryOptions {
  runJxa?: RunJxa;
}

export function ensureMacOS(): void {
  if (process.platform !== 'darwin') {
    throw new MacOSUnsupportedError();
  }
}

function normalizePreview(raw: unknown): NotePreview | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;

  const toStringOrNull = (value: unknown): string | null => {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return null;
  };

  const id = toStringOrNull(candidate.id);
  const name = toStringOrNull(candidate.name);
  const folderPath = toStringOrNull(candidate.folderPath);

  if (id === null && name === null && folderPath === null) {
    return null;
  }

  return { id, name, folderPath };
}

type JXANote = {
  id?: () => unknown;
  uuid?: () => unknown;
  name?: () => unknown;
};

type JXAFolder = {
  name?: () => unknown;
  notes?: () => unknown;
  folders?: () => unknown;
};

type JXAAccount = {
  folders?: () => unknown;
};

export async function fetchNotesSummary(options: FetchNotesSummaryOptions = {}): Promise<NotesSummary> {
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
          // JXA collections behave like array-likes but are not typed.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

      const allNotes = toArray<JXANote>(
        safe(() => (typeof Notes.notes === 'function' ? Notes.notes() : []))
      );

      let firstNote: NotePreview | null = null;

      const setFirstFromNote = (note: JXANote, folderPath: string | null): void => {
        if (firstNote) return;
        const idValue =
          safe(() => (typeof note.id === 'function' ? note.id() : null)) ??
          safe(() => (typeof note.uuid === 'function' ? note.uuid() : null));

        firstNote = {
          id: idValue == null ? null : String(idValue),
          name: safe(() => (typeof note.name === 'function' ? String(note.name()) : null)),
          folderPath: folderPath ?? null
        };
      };

      const walkFolder = (folder: JXAFolder, prefix: string): void => {
        const folderName =
          safe(() => (typeof folder.name === 'function' ? String(folder.name()) : 'Notes')) ||
          'Notes';
        const current = prefix ? `${prefix}/${folderName}` : folderName;

        const notes = toArray<JXANote>(
          safe(() => (typeof folder.notes === 'function' ? folder.notes() : []))
        );
        if (!firstNote && notes.length > 0) {
          setFirstFromNote(notes[0], current);
        }

        if (firstNote) {
          return;
        }

        const subfolders = toArray<JXAFolder>(
          safe(() => (typeof folder.folders === 'function' ? folder.folders() : []))
        );
        for (let i = 0; i < subfolders.length; i += 1) {
          walkFolder(subfolders[i], current);
          if (firstNote) break;
        }
      };

      const accounts = toArray<JXAAccount>(
        safe(() => (typeof Notes.accounts === 'function' ? Notes.accounts() : []))
      );
      for (let i = 0; i < accounts.length && !firstNote; i += 1) {
        const folders = toArray<JXAFolder>(
          safe(() => {
            const account = accounts[i];
            if (!account || typeof account.folders !== 'function') return [];
            return account.folders();
          })
        );
        for (let j = 0; j < folders.length && !firstNote; j += 1) {
          walkFolder(folders[j], '');
        }
      }

      if (!firstNote && allNotes.length > 0) {
        setFirstFromNote(allNotes[0], null);
      }

      return {
        totalNotes: allNotes.length,
        firstNote
      };
    })) as RawNotesResult;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

    const total =
      typeof result.totalNotes === 'number' ? result.totalNotes : Number(result.totalNotes);

    return {
      totalNotes: Number.isFinite(total) ? total : 0,
      firstNote: normalizePreview(result.firstNote) ?? null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NotesBridgeError(`Failed to query Apple Notes via JXA: ${message}`);
  }
}
