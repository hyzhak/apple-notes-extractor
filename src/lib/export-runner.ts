import fs from 'node:fs/promises';
import type { ExportContext } from './export-context';
import { getNoteCount, readNoteByIndex } from './notes/reader';
import type { NotesReaderOptions } from './notes/types';
import { LogLevel, logProgress, setLogLevel } from './notes/jxa-helpers';
import { NotesBridgeError } from './notes-bridge';
import { writeNoteHtml } from '../services/file-writer';
import type { IndexEntry, Note } from '../models/note';
import type { DateFilters, FolderFilters } from './filter-schema';
import { filterNote } from './filtering';
import { createProgressReporter } from './progress-reporter';

export interface ExportSummary {
  exported: number;
  skipped: Array<{ index: number; reason: string }>;
  indexPath: string;
  notesPath: string;
  firstNote:
    | {
        id: string;
        name: string;
        folderPath: string;
        htmlPath: string;
      }
    | null;
}

export async function exportNotes(
  context: ExportContext,
  readerOptions: NotesReaderOptions = {},
  filters: { folders?: FolderFilters; dates?: DateFilters } = {},
  options: { logLevel?: LogLevel } = {}
): Promise<ExportSummary> {
  if (options.logLevel !== undefined) {
    setLogLevel(options.logLevel);
  }
  logProgress('export.start', { target: context.targetDir });
  const reporter = createProgressReporter();
  const total = await getNoteCount(readerOptions);
  logProgress('export.count', { total });
  const entries: IndexEntry[] = [];
  let first: ExportSummary['firstNote'] = null;
  const skipped: ExportSummary['skipped'] = [];
  for (let i = 0; i < total; i += 1) {
    let note: Note;
    try {
      note = await readNoteByIndex(i, readerOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (error instanceof NotesBridgeError) {
        logProgress('export.skip', { idx: i + 1, reason: message });
        skipped.push({ index: i, reason: message });
        continue;
      }
      throw error;
    }
    const gate = filterNote(note, filters);
    if (!gate.allowed) {
      logProgress('export.skip', { idx: i + 1, reason: 'filtered', folder: note.folderPath });
      skipped.push({ index: i, reason: gate.reason ?? 'Filtered' });
      continue;
    }

    logProgress('export.note', { idx: i + 1, id: note.id });
    const result = await writeNoteHtml(note, context.notesPath);
    const entry = {
      noteId: note.id,
      noteName: note.name,
      artifacts: [],
      folderPath: note.folderPath,
      createdAtUtc: note.createdAtUtc,
      modifiedAtUtc: note.modifiedAtUtc,
      htmlPath: result.relativeHtmlPath
    };
    entries.push(entry);
    if (!first) {
      first = {
        id: entry.noteId,
        name: entry.noteName,
        folderPath: entry.folderPath,
        htmlPath: entry.htmlPath
      };
    }
    if (typeof readerOptions.limit === 'number' && entries.length >= readerOptions.limit) {
      break;
    }
    reporter.emit('export.progress', {
      processed: entries.length + skipped.length,
      exported: entries.length,
      skipped: skipped.length,
      total
    });
  }

  logProgress('export.written', { count: entries.length });
  await fs.writeFile(context.indexPath, JSON.stringify(entries, null, 2), 'utf8');
  logProgress('export.index.write', { count: entries.length, path: context.indexPath });

  return {
    exported: entries.length,
    skipped,
    indexPath: context.indexPath,
    notesPath: context.notesPath,
    firstNote: first
  };
}
