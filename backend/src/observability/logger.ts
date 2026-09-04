import { AsyncLocalStorage } from 'node:async_hooks';

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

type LogFields = { requestId?: string; method?: string; route?: string; status?: number; durationMs?: number; errorCode?: string };
type Level = 'info' | 'warn' | 'error';

/** Only operational fields: never serialize errors, queries, headers or payloads. */
export function writeLog(level: Level, event: string, fields: LogFields = {}): void {
  const record = {
    time: new Date().toISOString(), level, event,
    requestId: fields.requestId ?? requestContext.getStore()?.requestId,
    method: fields.method, route: fields.route, status: fields.status,
    durationMs: fields.durationMs, errorCode: fields.errorCode,
  };
  const stream = level === 'error' ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(record)}\n`);
}

function errorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  return typeof code === 'string' && /^(P\d{4}|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EPIPE)$/.test(code)
    ? code : 'UNCLASSIFIED';
}

export const logger = {
  info: (event: string) => writeLog('info', event),
  warn: (event: string, error?: unknown) => writeLog('warn', event, error === undefined ? {} : { errorCode: errorCode(error) }),
  error: (event: string, error?: unknown) => writeLog('error', event, { errorCode: errorCode(error) }),
};
