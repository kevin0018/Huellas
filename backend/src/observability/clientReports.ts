import type { ErrorRequestHandler, RequestHandler } from 'express';
import { clientFailures, metrics, type ClientFailure } from './metrics.js';
import { writeLog } from './logger.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Reports are untrusted counters, not authenticated audit records. No arbitrary text. */
export function clientReportHandler(observe = (kind: ClientFailure) => metrics.observeClient(kind)): RequestHandler {
  let windowStart = 0;
  let accepted = 0;
  return (req, res) => {
    const body: unknown = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !['kind', 'requestId'].includes(key))) { res.sendStatus(400); return; }
    const { kind, requestId } = body as Record<string, unknown>;
    if (!clientFailures.includes(kind as ClientFailure) ||
      (requestId !== undefined && (typeof requestId !== 'string' || !uuid.test(requestId)))) { res.sendStatus(400); return; }
    const now = Date.now();
    if (now - windowStart >= 60000) { windowStart = now; accepted = 0; }
    if (accepted >= 120) { res.sendStatus(429); return; }
    accepted++;
    observe(kind as ClientFailure);
    writeLog('warn', `frontend.${kind}`, { relatedRequestId: requestId as string | undefined });
    res.status(204).end();
  };
}

/** Parser failures may contain submitted text; do not serialize or report them. */
export const clientReportParseError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const tooLarge = error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large';
  res.sendStatus(tooLarge ? 413 : 400);
};
