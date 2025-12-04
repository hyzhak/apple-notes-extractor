import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFirstNote } from '../../src/lib/notes-reader';
import { MacOSUnsupportedError } from '../../src/lib/notes-bridge';

describe('readFirstNote', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
  });

  afterEach(() => {
    platformSpy.mockRestore();
  });

  it('maps raw JXA result into a Note', async () => {
    const runJxa = vi.fn().mockResolvedValue({
      id: 'note-123',
      name: 'Hello',
      bodyHtml: '<p>hi</p>',
      folderPath: 'Root/Sub',
      createdAtUtc: '2024-01-01T00:00:00Z',
      modifiedAtUtc: '2024-01-02T00:00:00Z'
    });

    const note = await readFirstNote({ runJxa });

    expect(runJxa).toHaveBeenCalled();
    expect(note).toEqual({
      id: 'note-123',
      name: 'Hello',
      bodyHtml: '<p>hi</p>',
      folderPath: 'Root/Sub',
      createdAtUtc: '2024-01-01T00:00:00.000Z',
      modifiedAtUtc: '2024-01-02T00:00:00.000Z',
      attachments: []
    });
  });

  it('throws when note is missing', async () => {
    const runJxa = vi.fn().mockResolvedValue(null);
    await expect(readFirstNote({ runJxa })).rejects.toThrow('No notes found');
  });

  it('guards non-macOS', async () => {
    platformSpy.mockReturnValue('linux');
    await expect(readFirstNote()).rejects.toThrow(MacOSUnsupportedError);
  });
});
