import { describe, expect, it } from 'vitest';
import { matchesFolder, parseFolderFilters } from '../../src/lib/filter-schema';

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
