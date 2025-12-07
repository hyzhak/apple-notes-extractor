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

export type NotesApp = {
  notes?: () => unknown;
};
