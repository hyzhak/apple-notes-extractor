export interface NoteHeader {
  id: string;
  name: string | null;
  folderPath?: string | null;
  createdAtUtc?: string | null;
  modifiedAtUtc?: string | null;
}

export interface NotesReaderOptions {
  runJxa?: (fn: (...args: any[]) => any, ...args: any[]) => Promise<any>;
  limit?: number;
}

export interface RawNoteResult {
  id: unknown;
  name: unknown;
  bodyHtml: unknown;
  folderPath: unknown;
  createdAtUtc: unknown;
  modifiedAtUtc: unknown;
}

export type JXANote = {
  id?: () => unknown;
  uuid?: () => unknown;
  name?: () => unknown;
  body?: () => unknown;
  creationDate?: () => unknown;
  modificationDate?: () => unknown;
};

export type JXAFolder = {
  name?: () => unknown;
  notes?: () => unknown;
  folders?: () => unknown;
};

export type JXAAccount = {
  folders?: () => unknown;
};

export type NotesApp = {
  includeStandardAdditions: boolean;
  accounts?: () => unknown;
  notes?: () => unknown;
};
