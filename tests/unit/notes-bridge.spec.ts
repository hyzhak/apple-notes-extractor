import { describe, expect, it, vi, afterEach } from 'vitest';
import { ensureMacOS, MacOSUnsupportedError } from '../../src/lib/notes-bridge';

describe('ensureMacOS', () => {
  let platformSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    platformSpy?.mockRestore();
  });

  it('throws on non-macOS platforms', () => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    expect(() => ensureMacOS()).toThrow(MacOSUnsupportedError);
  });

  it('passes silently on macOS', () => {
    platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    expect(() => ensureMacOS()).not.toThrow();
  });
});
