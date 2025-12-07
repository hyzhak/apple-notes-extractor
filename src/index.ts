// Public surface kept intentionally small
export { createExportContext } from './lib/export-context';
export { exportNotes } from './lib/export-runner';
export { getNoteCount, readNoteByIndex } from './lib/notes/reader';
export type { Note, IndexEntry } from './models/note';
export { buildNotePath, defaultSlug } from './services/pathing';
