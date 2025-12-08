import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotesBridgeError } from '../../src/lib/notes-bridge';

vi.mock('../../src/lib/notes/reader', () => ({
  getNoteCount: vi.fn(),
  readNoteByIndex: vi.fn()
}));

vi.mock('../../src/services/file-writer', () => ({
  writeNoteHtml: vi.fn()
}));

import { exportNotes } from '../../src/lib/export-runner';
import { parseDateFilters, parseFolderFilters } from '../../src/lib/filter-schema';
import { getNoteCount, readNoteByIndex } from '../../src/lib/notes/reader';
import { writeNoteHtml } from '../../src/services/file-writer';
import type { ExportContext } from '../../src/lib/export-context';
import type { Note } from '../../src/models/note';

let tempDir: string;

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

function createNote(): Note {
  return {
    id: '1',
    name: 'First',
    bodyHtml: '<p>1</p>',
    folderPath: 'Notes',
    createdAtUtc: '2024-01-01T00:00:00Z',
    modifiedAtUtc: '2024-01-02T00:00:00Z',
    attachments: []
  };
}

describe('exportNotes', () => {
  it('reads count and writes notes one by one', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'export-runner-'));
    const context: ExportContext = {
      targetDir: tempDir,
      notesPath: path.join(tempDir, 'notes'),
      artifactsPath: path.join(tempDir, 'artifacts'),
      indexPath: path.join(tempDir, 'index.json'),
      includeAttachments: false
    };

    vi.mocked(getNoteCount).mockResolvedValue(1);
    vi.mocked(readNoteByIndex).mockResolvedValue(createNote());

    vi.mocked(writeNoteHtml).mockResolvedValue({
      absoluteHtmlPath: path.join(context.notesPath, 'Notes/First_1.html'),
      relativeHtmlPath: 'Notes/First_1.html'
    });

    const summary = await exportNotes(context);

    const indexContent = await fs.readFile(context.indexPath, 'utf8');

    expect(indexContent.length).toBeGreaterThan(0);
    expect(summary.exported).toBe(1);
    expect(summary.skipped).toEqual([]);
    expect(summary.firstNote?.id).toBe('1');
    expect(getNoteCount).toHaveBeenCalledTimes(1);
    expect(readNoteByIndex).toHaveBeenCalledTimes(1);
    expect(writeNoteHtml).toHaveBeenCalledTimes(1);
  });
  it('tracks skipped notes', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'export-runner-'));
    const context: ExportContext = {
      targetDir: tempDir,
      notesPath: path.join(tempDir, 'notes'),
      artifactsPath: path.join(tempDir, 'artifacts'),
      indexPath: path.join(tempDir, 'index.json'),
      includeAttachments: false
    };

    vi.mocked(getNoteCount).mockResolvedValue(2);
    vi.mocked(readNoteByIndex).mockImplementation((idx: number) => {
      if (idx === 0) return Promise.resolve(createNote());
      return Promise.reject(new NotesBridgeError('missing'));
    });

    vi.mocked(writeNoteHtml).mockResolvedValue({
      absoluteHtmlPath: path.join(context.notesPath, 'Notes/First_1.html'),
      relativeHtmlPath: 'Notes/First_1.html'
    });

    const summary = await exportNotes(context);

    expect(summary.exported).toBe(1);
    expect(summary.skipped).toEqual([{ index: 1, reason: 'missing' }]);
  });

  it('skips notes filtered by folder', async () => {
    vi.mocked(writeNoteHtml).mockClear();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'export-runner-'));
    const context: ExportContext = {
      targetDir: tempDir,
      notesPath: path.join(tempDir, 'notes'),
      artifactsPath: path.join(tempDir, 'artifacts'),
      indexPath: path.join(tempDir, 'index.json'),
      includeAttachments: false
    };

    vi.mocked(getNoteCount).mockResolvedValue(1);
    vi.mocked(readNoteByIndex).mockResolvedValue({ ...createNote(), folderPath: 'SkipMe' });

    const filters = parseFolderFilters({ excludeFolders: ['SkipMe'] });

    const summary = await exportNotes(context, {}, { folders: filters });

    expect(summary.exported).toBe(0);
    expect(summary.skipped).toEqual([{ index: 0, reason: 'Filtered by folder: SkipMe' }]);
    expect(writeNoteHtml).not.toHaveBeenCalled();
  });

  it('skips notes filtered by date bounds', async () => {
    vi.mocked(writeNoteHtml).mockClear();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'export-runner-'));
    const context: ExportContext = {
      targetDir: tempDir,
      notesPath: path.join(tempDir, 'notes'),
      artifactsPath: path.join(tempDir, 'artifacts'),
      indexPath: path.join(tempDir, 'index.json'),
      includeAttachments: false
    };

    vi.mocked(getNoteCount).mockResolvedValue(1);
    vi.mocked(readNoteByIndex).mockResolvedValue({ ...createNote(), modifiedAtUtc: '2020-01-01T00:00:00Z' });

    const dates = parseDateFilters({ modifiedAfter: '2022-01-01T00:00:00Z' });

    const summary = await exportNotes(context, {}, { dates });

    expect(summary.exported).toBe(0);
    expect(summary.skipped).toEqual([{ index: 0, reason: 'Filtered by date' }]);
    expect(writeNoteHtml).not.toHaveBeenCalled();
  });
});
