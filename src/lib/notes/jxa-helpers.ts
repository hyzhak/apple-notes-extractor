export type RunJxa = (fn: (...args: any[]) => any, ...args: any[]) => Promise<any>;

export enum LogLevel {
  Quiet = 0,
  Info = 1,
  Debug = 2
}

let currentLevel: LogLevel = process.env.NOTES_DEBUG ? LogLevel.Debug : LogLevel.Info;

export const setLogLevel = (level: LogLevel): void => {
  currentLevel = level;
};

export const debugLog = (message: string, data?: unknown): void => {
  if (currentLevel < LogLevel.Debug) return;
  const payload = data === undefined ? '' : ` ${JSON.stringify(data)}`;
  console.error(`[notes-debug] ${message}${payload}`);
};

export const logProgress = (message: string, data?: unknown): void => {
  if (currentLevel < LogLevel.Info && message !== 'export.progress' && message !== 'export.count' && message !== 'export.start' && message !== 'export.index.write' && message !== 'export.written') {
    return;
  }
  const payload = data === undefined ? '' : ` ${JSON.stringify(data)}`;
  console.error(`[notes] ${message}${payload}`);
};
