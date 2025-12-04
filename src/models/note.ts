export interface Note {
  id: string;
  name: string;
  bodyHtml: string;
  folderPath: string;
  createdAtUtc: string;
  modifiedAtUtc: string;
  attachments: string[];
}

export interface IndexEntry {
  noteId: string;
  noteName: string;
  artifacts: string[];
  folderPath: string;
  createdAtUtc: string;
  modifiedAtUtc: string;
  htmlPath: string;
}
