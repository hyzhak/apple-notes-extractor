export class MacOSUnsupportedError extends Error {
  constructor(message = 'Apple Notes export requires macOS.') {
    super(message);
    this.name = 'MacOSUnsupportedError';
  }
}

export class NotesBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotesBridgeError';
  }
}

export function ensureMacOS(): void {
  if (process.platform !== 'darwin') {
    throw new MacOSUnsupportedError();
  }
}
