export interface FolderFilters {
  include?: string[];
  exclude?: string[];
}

const normalize = (value: string): string => value.trim().replace(/^\/+|\/+$/g, '').toLowerCase();

function cleanList(values?: string[]): string[] | undefined {
  if (!values) return undefined;
  const cleaned = values
    .flatMap((v) => v.split(','))
    .map(normalize)
    .filter((v) => v.length > 0);
  return cleaned.length ? cleaned : undefined;
}

export function parseFolderFilters(input: {
  includeFolders?: string[];
  excludeFolders?: string[];
}): FolderFilters {
  return {
    include: cleanList(input.includeFolders),
    exclude: cleanList(input.excludeFolders)
  };
}

export function matchesFolder(folderPath: string, filters: FolderFilters): boolean {
  const normalized = normalize(folderPath);

  const matchesAny = (needles?: string[]) =>
    needles?.some((needle) => normalized === needle || normalized.startsWith(`${needle}/`)) ?? false;

  if (filters.include && !matchesAny(filters.include)) {
    return false;
  }
  if (filters.exclude && matchesAny(filters.exclude)) {
    return false;
  }
  return true;
}
