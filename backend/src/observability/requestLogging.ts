import { metrics } from './metrics.js';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { requestContext, writeLog } from './logger.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const scopes = new Set(['', '/api', ...['auth', 'owners', 'volunteers', 'pets', 'procedures', 'checkups', 'appointments', 'health-events', 'health-documents', 'reminders', 'shared-health', 'health-shares', 'chat'].map(scope => `/api/${scope}`)]);
const methods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

export const requestLogging: RequestHandler = (req, res, next) => {
  const supplied = req.get('X-Request-ID');
  const requestId = supplied && uuid.test(supplied) ? supplied : randomUUID();
  const started = performance.now();
  res.setHeader('X-Request-ID', requestId);
  let logged = false;
  const complete = () => {
    if (logged) return;
    logged = true;
    const status = res.writableFinished ? res.statusCode : 499;
    // Express route templates are code-owned; originalUrl, params and query are private.
    const path: unknown = req.route?.path;
    const route = typeof path === 'string' && scopes.has(req.baseUrl) ? `${req.baseUrl}${path}` : 'unmatched';
    const method = methods.has(req.method) ? req.method : 'OTHER';
    if (path !== '/metrics') metrics.observeHttp(method, status, (performance.now() - started) / 1000);
    writeLog(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', 'http.request', {
      requestId, method: methods.has(req.method) ? req.method : 'OTHER', route, status,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
    });
  };
  res.once('finish', complete);
  res.once('close', complete);
  requestContext.run({ requestId }, next);
};
