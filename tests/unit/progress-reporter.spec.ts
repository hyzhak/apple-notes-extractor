import { describe, expect, it, vi } from 'vitest';
import { ProgressReporter } from '../../src/lib/progress-reporter';
import * as helpers from '../../src/lib/notes/jxa-helpers';

describe('ProgressReporter', () => {
  it('throttles export.progress events', () => {
    const spy = vi.spyOn(helpers, 'logProgress').mockImplementation(() => {});
    vi.useFakeTimers();

    const reporter = new ProgressReporter({ rateMs: 1000 });
    reporter.emit('export.progress', { processed: 1 });
    reporter.emit('export.progress', { processed: 2 });

    vi.advanceTimersByTime(999);
    reporter.emit('export.progress', { processed: 3 });
    vi.advanceTimersByTime(1);
    reporter.emit('export.progress', { processed: 4 });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toBe('export.progress');
    expect(spy.mock.calls[1][0]).toBe('export.progress');

    vi.useRealTimers();
    spy.mockRestore();
  });

  it('always emits non-progress events', () => {
    const spy = vi.spyOn(helpers, 'logProgress').mockImplementation(() => {});
    const reporter = new ProgressReporter({ rateMs: 1000 });

    reporter.emit('export.count', { total: 10 });
    reporter.emit('export.note', { idx: 1 });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toBe('export.count');
    expect(spy.mock.calls[1][0]).toBe('export.note');

    spy.mockRestore();
  });
});
