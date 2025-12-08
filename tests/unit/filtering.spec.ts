import { describe, expect, it } from 'vitest';
import { shouldExportFolder } from '../../src/lib/filtering';
import { parseFolderFilters } from '../../src/lib/filter-schema';

describe('filtering', () => {
  it('returns true when folder passes filters', () => {
    const filters = parseFolderFilters({ includeFolders: ['Work'] });
    expect(shouldExportFolder('Work/Sub', filters)).toBe(true);
  });

  it('returns false when folder blocked', () => {
    const filters = parseFolderFilters({ excludeFolders: ['Archive'] });
    expect(shouldExportFolder('Archive/Old', filters)).toBe(false);
  });
});
