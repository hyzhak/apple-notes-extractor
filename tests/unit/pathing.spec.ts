import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildNotePath, defaultSlug } from '../../src/services/pathing';
import { Note } from '../../src/models/note';

const sampleNote: Note = {
  id: 'abc-123',
  name: 'My First Note!',
  bodyHtml: '<p>Hello</p>',
  folderPath: 'Notes/Personal',
  createdAtUtc: '2024-01-01T00:00:00Z',
  modifiedAtUtc: '2024-01-02T00:00:00Z',
  attachments: []
};

describe('pathing', () => {
  it('creates deterministic slug from name and id', () => {
    expect(defaultSlug(sampleNote)).toBe('My-First-Note_abc-123');
  });

  it('uses folder path and slug to build relative and absolute paths', () => {
    const notesRoot = '/tmp/notes-root';
    const info = buildNotePath(sampleNote, notesRoot);

    expect(info.relativeHtmlPath).toBe('Notes/Personal/My-First-Note_abc-123.html');
    expect(info.absoluteHtmlPath).toBe(
      path.join(notesRoot, 'Notes/Personal/My-First-Note_abc-123.html')
    );
  });

  it('sanitizes unsafe characters and trims separators', () => {
    const dirtyNote: Note = {
      ...sampleNote,
      id: '###$$$',
      name: '   weird   name ### ',
      folderPath: '/Root//Child & Misc/'
    };

    const info = buildNotePath(dirtyNote, '/tmp/root');

    expect(info.relativeHtmlPath).toBe('Root/Child-Misc/weird-name_note.html');
  });
});
