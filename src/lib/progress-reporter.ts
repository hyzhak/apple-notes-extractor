import { logProgress } from './notes/jxa-helpers';

type EventName =
  | 'export.progress'
  | 'export.start'
  | 'export.count'
  | 'export.note'
  | 'export.skip'
  | 'export.written'
  | 'export.index.write';

interface ProgressReporterOptions {
  /**
   * Minimum milliseconds between emissions of repeated progress events.
   */
  rateMs?: number;
}

export class ProgressReporter {
  private lastAt = 0;
  private readonly rateMs: number;

  constructor(options: ProgressReporterOptions = {}) {
    this.rateMs = options.rateMs ?? 2000;
  }

  emit(event: EventName, data?: unknown, force = false): void {
    const now = Date.now();
    if (!force && now - this.lastAt < this.rateMs && event === 'export.progress') {
      return;
    }
    this.lastAt = now;
    logProgress(event, data);
  }
}

export const createProgressReporter = (options?: ProgressReporterOptions): ProgressReporter =>
  new ProgressReporter(options);
