import { describe, expect, it } from 'vitest';
import { matchesFolder, parseFolderFilters, parseDateFilters } from '../../src/lib/filter-schema';

describe('folder filters', () => {
  it('allows all when no filters', () => {
    const filters = parseFolderFilters({});
    expect(matchesFolder('Notes/Work', filters)).toBe(true);
  });

  it('includes only matching prefixes (case-insensitive)', () => {
    const filters = parseFolderFilters({ includeFolders: ['work'] });
    expect(matchesFolder('Work/Project', filters)).toBe(true);
    expect(matchesFolder('Personal/Project', filters)).toBe(false);
  });

  it('excludes matching prefixes', () => {
    const filters = parseFolderFilters({ excludeFolders: ['Archive'] });
    expect(matchesFolder('Archive/Old', filters)).toBe(false);
    expect(matchesFolder('Notes/Work', filters)).toBe(true);
  });

  it('apply include then exclude', () => {
    const filters = parseFolderFilters({ includeFolders: ['Work'], excludeFolders: ['Work/Secret'] });
    expect(matchesFolder('Work/Secret/Doc', filters)).toBe(false);
    expect(matchesFolder('Work/Open', filters)).toBe(true);
    expect(matchesFolder('Personal', filters)).toBe(false);
  });
});

describe('date filters', () => {
  it('parses valid ISO strings', () => {
    const filters = parseDateFilters({
      createdAfter: '2024-01-01T00:00:00Z',
      createdBefore: '2024-12-31T00:00:00Z'
    });
    expect(filters.createdAfter?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(filters.createdBefore?.toISOString()).toBe('2024-12-31T00:00:00.000Z');
  });

  it('throws on invalid date', () => {
    expect(() =>
      parseDateFilters({
        createdAfter: 'not-a-date'
      })
    ).toThrow(/Invalid date/);
  });
});
