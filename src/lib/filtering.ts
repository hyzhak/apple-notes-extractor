import type { FolderFilters } from './filter-schema';
import { matchesFolder } from './filter-schema';

export function shouldExportFolder(folderPath: string, filters: FolderFilters): boolean {
  return matchesFolder(folderPath, filters);
}
