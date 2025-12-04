import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  ensureMacOS,
  fetchNotesSummary,
  MacOSUnsupportedError,
  NotesBridgeError
} from '../../src/lib/notes-bridge';

describe('ensureMacOS', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    platformSpy?.mockRestore();
  });

  it('throws on non-macOS platforms', () => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    expect(() => ensureMacOS()).toThrow(MacOSUnsupportedError);
  });

  it('passes silently on macOS', () => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    expect(() => ensureMacOS()).not.toThrow();
  });
});

describe('fetchNotesSummary', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
  });

  afterEach(() => {
    platformSpy?.mockRestore();
  });

  it('maps JXA response into a summary shape', async () => {
    const runJxa = vi.fn().mockResolvedValue({
      totalNotes: 3,
      firstNote: { id: 'note-1', name: 'First note', folderPath: 'Notes' }
    });

    const summary = await fetchNotesSummary({ runJxa });

    expect(runJxa).toHaveBeenCalledTimes(1);
    expect(summary).toEqual({
      totalNotes: 3,
      firstNote: { id: 'note-1', name: 'First note', folderPath: 'Notes' }
    });
  });

  it('normalizes missing first note to null', async () => {
    const runJxa = vi.fn().mockResolvedValue({
      totalNotes: 0,
      firstNote: undefined
    });

    const summary = await fetchNotesSummary({ runJxa });

    expect(summary.firstNote).toBeNull();
    expect(summary.totalNotes).toBe(0);
  });

  it('wraps JXA failures with a NotesBridgeError', async () => {
    const runJxa = vi.fn().mockRejectedValue(new Error('permission denied'));

    await expect(fetchNotesSummary({ runJxa })).rejects.toThrow(NotesBridgeError);
  });
});
