import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getNoteCount, readNoteByIndex } from '../../src/lib/notes/reader';
import type { NotesReaderOptions } from '../../src/lib/notes/types';
import { MacOSUnsupportedError, NotesBridgeError } from '../../src/lib/notes-bridge';

describe('getNoteCount', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
  });

  afterEach(() => {
    platformSpy.mockRestore();
  });

  it('returns note count from JXA', async () => {
    const runJxa = vi.fn().mockResolvedValue(7) as unknown as NotesReaderOptions['runJxa'];

    const count = await getNoteCount({ runJxa });

    expect(count).toBe(7);
    expect(runJxa).toHaveBeenCalledTimes(1);
  });

  it('guards non-macOS', async () => {
    platformSpy.mockReturnValue('linux');
    await expect(getNoteCount()).rejects.toThrow(MacOSUnsupportedError);
  });
});

describe('readNoteByIndex', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
  });

  afterEach(() => {
    platformSpy.mockRestore();
  });

  it('normalizes raw note result', async () => {
    const runJxa = vi.fn().mockResolvedValue({
      id: 'note-123',
      name: 'Hello',
      bodyHtml: '<p>Hi</p>',
      folderPath: 'Root/Sub',
      createdAtUtc: '2024-01-01T00:00:00Z',
      modifiedAtUtc: '2024-01-02T00:00:00Z'
    }) as unknown as NotesReaderOptions['runJxa'];

    const note = await readNoteByIndex(0, { runJxa });

    expect(note).toEqual({
      id: 'note-123',
      name: 'Hello',
      bodyHtml: '<p>Hi</p>',
      folderPath: 'Root/Sub',
      createdAtUtc: '2024-01-01T00:00:00.000Z',
      modifiedAtUtc: '2024-01-02T00:00:00.000Z',
      attachments: []
    });
  });

  it('throws when index is missing', async () => {
    const runJxa = vi.fn().mockResolvedValue(null) as unknown as NotesReaderOptions['runJxa'];
    await expect(readNoteByIndex(2, { runJxa })).rejects.toThrow(NotesBridgeError);
  });

  it('guards non-macOS', async () => {
    platformSpy.mockReturnValue('linux');
    await expect(readNoteByIndex(0)).rejects.toThrow(MacOSUnsupportedError);
  });
});
