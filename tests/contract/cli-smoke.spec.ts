import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/notes-bridge', () => {
  return {
    ensureMacOS: vi.fn(),
    fetchNotesSummary: vi.fn()
  };
});

import { ensureMacOS, fetchNotesSummary } from '../../src/lib/notes-bridge';
import { main } from '../../src/cli/index';

describe('cli smoke path', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    vi.mocked(ensureMacOS).mockReset();
    vi.mocked(fetchNotesSummary).mockReset();
    process.exitCode = 0;
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('writes summary to index.json and prints status', async () => {
    vi.mocked(fetchNotesSummary).mockResolvedValue({
      totalNotes: 2,
      firstNote: { id: 'abc', name: 'Hello', folderPath: 'Notes/Personal' }
    });

    const targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-cli-'));
    try {
      await main(['node', 'cli', '--target', targetDir, '--force']);

      const indexJson = await fs.readFile(path.join(targetDir, 'index.json'), 'utf8');
      const parsed = JSON.parse(indexJson) as {
        noteCount: number;
        firstNote: { id: string; name: string; folderPath: string };
      };

      expect(parsed).toEqual({
        noteCount: 2,
        firstNote: { id: 'abc', name: 'Hello', folderPath: 'Notes/Personal' }
      });
      expect(ensureMacOS).toHaveBeenCalledTimes(1);
      expect(fetchNotesSummary).toHaveBeenCalledTimes(1);
      expect(process.exitCode).toBe(0);
      expect(stdoutSpy).toHaveBeenCalled();
    } finally {
      await fs.rm(targetDir, { recursive: true, force: true });
    }
  });

  it('fails cleanly when macOS guard rejects', async () => {
    vi.mocked(ensureMacOS).mockImplementation(() => {
      throw new Error('not mac');
    });

    const targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-cli-'));
    try {
      await main(['node', 'cli', '--target', targetDir, '--force']);
    } finally {
      await fs.rm(targetDir, { recursive: true, force: true });
    }

    expect(fetchNotesSummary).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
