import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/notes-bridge', () => {
  return {
    ensureMacOS: vi.fn()
  };
});

vi.mock('../../src/lib/export-runner', () => {
  return {
    exportNotes: vi.fn()
  };
});

import { ensureMacOS } from '../../src/lib/notes-bridge';
import { exportNotes } from '../../src/lib/export-runner';
import { main } from '../../src/cli/index';

describe('cli smoke path', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    vi.mocked(ensureMacOS).mockReset();
    vi.mocked(exportNotes).mockReset();
    process.exitCode = 0;
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('writes summary to index.json and prints status', async () => {
    vi.mocked(exportNotes).mockImplementation(async (context) => {
      const entries = [
        {
          noteId: 'abc',
          noteName: 'Hello',
          artifacts: [],
          folderPath: 'Notes/Personal',
          createdAtUtc: '2024-01-01T00:00:00Z',
          modifiedAtUtc: '2024-01-02T00:00:00Z',
          htmlPath: 'Notes/Personal/Hello_abc.html'
        }
      ];
      await fs.writeFile(context.indexPath, JSON.stringify(entries, null, 2), 'utf8');
      return {
        exported: entries.length,
        indexPath: context.indexPath,
        notesPath: context.notesPath,
        skipped: [],
        firstNote: {
          id: entries[0].noteId,
          name: entries[0].noteName,
          folderPath: entries[0].folderPath,
          htmlPath: entries[0].htmlPath
        }
      };
    });

    const targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-cli-'));
    try {
      await main(['node', 'cli', '--target', targetDir, '--force']);

      const indexJson = await fs.readFile(path.join(targetDir, 'index.json'), 'utf8');
      const parsed = JSON.parse(indexJson) as any[];

      expect(parsed).toEqual([
        {
          noteId: 'abc',
          noteName: 'Hello',
          artifacts: [],
          folderPath: 'Notes/Personal',
          createdAtUtc: '2024-01-01T00:00:00Z',
          modifiedAtUtc: '2024-01-02T00:00:00Z',
          htmlPath: 'Notes/Personal/Hello_abc.html'
        }
      ]);
      expect(ensureMacOS).toHaveBeenCalledTimes(1);
      expect(exportNotes).toHaveBeenCalledTimes(1);
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

    expect(exportNotes).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
