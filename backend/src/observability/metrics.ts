import { Counter, Gauge, Histogram, Registry } from '@prometheus-io/client';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

export type ClientFailure = 'render' | 'runtime' | 'unhandled_rejection' | 'network' | 'http_5xx';
export const clientFailures: readonly ClientFailure[] = ['render', 'runtime', 'unhandled_rejection', 'network', 'http_5xx'];

export function createMetrics() {
  const registry = new Registry();
  const requests = new Counter({ name: 'huellas_http_requests_total', help: 'Completed HTTP requests by method and status.', labelNames: ['method', 'status'], registers: [registry] });
  const latency = new Histogram({ name: 'huellas_http_request_duration_seconds', help: 'HTTP response latency including aborted requests.', labelNames: ['method'], buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5], registers: [registry] });
  const failures = new Counter({ name: 'huellas_frontend_failures_total', help: 'Accepted coarse frontend failure reports; untrusted client input.', labelNames: ['kind'], registers: [registry] });
  const connections = new Gauge({ name: 'huellas_mysql_connections', help: 'Server-wide MySQL connections, not a per-application pool count.', labelNames: ['state'], registers: [registry] });
  const connectionCheck = new Gauge({ name: 'huellas_mysql_metrics_up', help: 'Whether the last MySQL connection sample succeeded.', registers: [registry] });
  return {
    registry,
    observeHttp(method: string, status: number, seconds: number) { requests.inc({ method, status: String(status) }); latency.observe({ method }, seconds); },
    observeClient(kind: ClientFailure) { failures.inc({ kind }); },
    observeConnections(sample: { connected: number; running: number } | null) {
      connectionCheck.set(sample ? 1 : 0);
      connections.reset();
      if (sample) { connections.set({ state: 'connected' }, sample.connected); connections.set({ state: 'running' }, sample.running); }
    },
  };
}
export const metrics = createMetrics();

export function metricsHandler(token: string | undefined, collect: () => Promise<void>, registry: Registry): RequestHandler {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!token || token.length < 32) { res.sendStatus(404); return; }
    if (!timingSafeEqual(digest(req.get('Authorization') ?? ''), digest(`Bearer ${token}`))) { res.sendStatus(401); return; }
    void collect().then(() => registry.metrics()).then(body => {
      res.setHeader('Content-Type', registry.contentType);
      res.send(body);
    }).catch(next);
  };
}
