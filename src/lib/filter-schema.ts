export interface FolderFilters {
  include?: string[];
  exclude?: string[];
}

export interface DateFilters {
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
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

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return parsed;
}

export function parseDateFilters(input: {
  createdAfter?: string;
  createdBefore?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
}): DateFilters {
  return {
    createdAfter: parseDate(input.createdAfter),
    createdBefore: parseDate(input.createdBefore),
    modifiedAfter: parseDate(input.modifiedAfter),
    modifiedBefore: parseDate(input.modifiedBefore)
  };
}
