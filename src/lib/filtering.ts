import type { DateFilters, FolderFilters } from './filter-schema';
import { matchesFolder } from './filter-schema';
import type { Note } from '../models/note';

export function shouldExportFolder(folderPath: string, filters: FolderFilters): boolean {
  return matchesFolder(folderPath, filters);
}

function matchesDate(value: string, after?: Date, before?: Date): boolean {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  if (after && parsed.getTime() < after.getTime()) return false;
  if (before && parsed.getTime() > before.getTime()) return false;
  return true;
}

export function filterNote(
  note: Note,
  filters: { folders?: FolderFilters; dates?: DateFilters }
): { allowed: boolean; reason?: string } {
  const folderFilters = filters.folders ?? {};
  if (!shouldExportFolder(note.folderPath, folderFilters)) {
    return { allowed: false, reason: `Filtered by folder: ${note.folderPath}` };
  }

  const dateFilters = filters.dates ?? {};
  const createdOk = matchesDate(note.createdAtUtc, dateFilters.createdAfter, dateFilters.createdBefore);
  const modifiedOk = matchesDate(note.modifiedAtUtc, dateFilters.modifiedAfter, dateFilters.modifiedBefore);

  if (!createdOk || !modifiedOk) {
    return { allowed: false, reason: 'Filtered by date' };
  }

  return { allowed: true };
}
