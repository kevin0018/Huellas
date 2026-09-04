import { reportClientFailure } from '../observability/clientReports';
import { correlatedFetch, validRequestId } from './requestId';
import { ClientError, type ClientErrorCode } from '../errors/ClientError';

/** HTTP status plus a server message, or an explicitly identified local fallback. */
export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  readonly fallbackCode?: ClientErrorCode;

  constructor(message: string, status: number, fallbackCode?: ClientErrorCode, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requestId = requestId;
    this.fallbackCode = fallbackCode;
  }
}

export async function fetchResponse(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await correlatedFetch(input, init);
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    reportClientFailure('network');
    throw new ClientError('NETWORK', { cause });
  }
}

export async function ensureResponseOk(
  response: Response,
  fallback: ClientErrorCode = 'REQUEST_FAILED',
): Promise<void> {
  if (response.ok) return;
  const requestId = validRequestId(response.headers.get('X-Request-ID'));
  if (response.status >= 500) reportClientFailure('http_5xx', requestId);
  const body = await response.text();
  if (body) {
    let parsed: unknown;
    try { parsed = JSON.parse(body); }
    catch { throw new ApiError(body, response.status, undefined, requestId); }
    if (typeof parsed === 'string' && parsed) throw new ApiError(parsed, response.status, undefined, requestId);
    if (parsed && typeof parsed === 'object') {
      const payload = parsed as { error?: unknown; message?: unknown };
      if (typeof payload.error === 'string' && payload.error) throw new ApiError(payload.error, response.status, undefined, requestId);
      if (typeof payload.message === 'string' && payload.message) throw new ApiError(payload.message, response.status, undefined, requestId);
    }
  }
  throw new ApiError(`HTTP ${response.status}`, response.status, fallback, requestId);
}
