import type { Note } from '../../models/note';
import { NotesBridgeError } from '../notes-bridge';
import type { RawNoteResult } from './types';

export function coerceString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string' || value instanceof Date) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export function normalizeNote(raw: RawNoteResult | null, fallback?: Partial<RawNoteResult>): Note {
  const merged: RawNoteResult = {
    id: raw?.id ?? fallback?.id ?? null,
    name: raw?.name ?? fallback?.name ?? null,
    bodyHtml: raw?.bodyHtml ?? fallback?.bodyHtml ?? '',
    folderPath: raw?.folderPath ?? fallback?.folderPath ?? 'Notes',
    createdAtUtc: raw?.createdAtUtc ?? fallback?.createdAtUtc ?? null,
    modifiedAtUtc: raw?.modifiedAtUtc ?? fallback?.modifiedAtUtc ?? null
  };

  const id = coerceString(merged.id);
  if (!id) {
    throw new NotesBridgeError('Apple Notes returned a note without an id.');
  }

  const name = coerceString(merged.name) ?? id;
  const folderPath = coerceString(merged.folderPath) ?? 'Notes';
  const createdAtUtc = toIsoString(merged.createdAtUtc) ?? new Date().toISOString();
  const modifiedAtUtc = toIsoString(merged.modifiedAtUtc) ?? createdAtUtc;
  const bodyHtml = coerceString(merged.bodyHtml) ?? '';

  return {
    id,
    name,
    bodyHtml,
    folderPath,
    createdAtUtc,
    modifiedAtUtc,
    attachments: []
  };
}
