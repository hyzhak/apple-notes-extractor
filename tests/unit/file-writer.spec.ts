import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { writeNoteHtml } from '../../src/services/file-writer';
import { Note } from '../../src/models/note';

const sampleNote: Note = {
  id: 'id-1',
  name: 'Sample',
  bodyHtml: '<p>hello</p>',
  folderPath: 'Notes/Sub',
  createdAtUtc: '2024-01-01T12:00:00Z',
  modifiedAtUtc: '2024-01-02T12:00:00Z',
  attachments: []
};

let tempDir: string;

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('writeNoteHtml', () => {
  it('writes html file with timestamps and returns paths', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'note-writer-'));

    const result = await writeNoteHtml(sampleNote, tempDir);

    const content = await fs.readFile(result.absoluteHtmlPath, 'utf8');
    expect(content).toBe(sampleNote.bodyHtml);
    expect(result.relativeHtmlPath).toBe('Notes/Sub/Sample_id-1.html');

    const stats = await fs.stat(result.absoluteHtmlPath);
    expect(Math.abs(stats.mtime.getTime() - new Date(sampleNote.modifiedAtUtc).getTime())).toBeLessThan(2000);
  });
});
