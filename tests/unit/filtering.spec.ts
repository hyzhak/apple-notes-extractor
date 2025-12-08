import { describe, expect, it } from 'vitest';
import { filterNote, shouldExportFolder } from '../../src/lib/filtering';
import { parseFolderFilters, parseDateFilters } from '../../src/lib/filter-schema';

describe('filtering', () => {
  it('returns true when folder passes filters', () => {
    const filters = parseFolderFilters({ includeFolders: ['Work'] });
    expect(shouldExportFolder('Work/Sub', filters)).toBe(true);
  });

  it('returns false when folder blocked', () => {
    const filters = parseFolderFilters({ excludeFolders: ['Archive'] });
    expect(shouldExportFolder('Archive/Old', filters)).toBe(false);
  });

  it('filters notes by created date bounds', () => {
    const note = {
      id: '1',
      name: 'n',
      bodyHtml: '<p>n</p>',
      folderPath: 'Notes',
      createdAtUtc: '2024-05-01T00:00:00Z',
      modifiedAtUtc: '2024-05-02T00:00:00Z',
      attachments: []
    };
    const dates = parseDateFilters({ createdAfter: '2024-01-01T00:00:00Z', createdBefore: '2024-06-01T00:00:00Z' });
    expect(filterNote(note, { dates }).allowed).toBe(true);

    const tight = parseDateFilters({ createdAfter: '2024-05-10T00:00:00Z' });
    expect(filterNote(note, { dates: tight }).allowed).toBe(false);
  });

  it('rejects when modified date is outside bounds', () => {
    const note = {
      id: '1',
      name: 'n',
      bodyHtml: '<p>n</p>',
      folderPath: 'Notes',
      createdAtUtc: '2024-01-01T00:00:00Z',
      modifiedAtUtc: '2024-02-01T00:00:00Z',
      attachments: []
    };
    const dates = parseDateFilters({ modifiedBefore: '2024-01-15T00:00:00Z' });
    const result = filterNote(note, { dates });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Filtered by date');
  });
});
