import { apiUrl } from '../api/apiConfig';
import { validRequestId } from '../api/requestId';

type FailureKind = 'render' | 'runtime' | 'unhandled_rejection' | 'network' | 'http_5xx';
let windowStart = 0;
const sent = new Set<FailureKind>();

/** One report per category per minute. Deliberately accepts no Error or URL. */
export function reportClientFailure(kind: FailureKind, requestId?: string): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - windowStart >= 60000) { sent.clear(); windowStart = now; }
  if (sent.has(kind)) return;
  sent.add(kind);
  // Native fetch avoids recursively reporting failure of the collector itself.
  try {
    void fetch(apiUrl('/client-errors'), {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, requestId: validRequestId(requestId ?? null) }),
      keepalive: true, signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  } catch { /* Telemetry must never affect the original user action. */ }
}

export function installClientErrorReporting(): () => void {
  const runtime = () => reportClientFailure('runtime');
  const rejection = (event: PromiseRejectionEvent) => {
    if (event.reason instanceof Error && event.reason.name === 'AbortError') return;
    reportClientFailure('unhandled_rejection');
  };
  window.addEventListener('error', runtime);
  window.addEventListener('unhandledrejection', rejection);
  return () => { window.removeEventListener('error', runtime); window.removeEventListener('unhandledrejection', rejection); };
}
