export type RunJxa = (fn: (...args: any[]) => any, ...args: any[]) => Promise<any>;

export const debugLog = (message: string, data?: unknown): void => {
  if (process.env.NOTES_DEBUG) {
    const payload = data === undefined ? '' : ` ${JSON.stringify(data)}`;
    console.error(`[notes-debug] ${message}${payload}`);
  }
};

export const logProgress = (message: string, data?: unknown): void => {
  const payload = data === undefined ? '' : ` ${JSON.stringify(data)}`;
  console.error(`[notes] ${message}${payload}`);
};
