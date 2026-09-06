import express from 'express';
import request from 'supertest';
import { afterEach, expect, it, vi } from 'vitest';
import { createMetrics, metricsHandler } from './metrics.js';
import { clientReportHandler, clientReportParseError } from './clientReports.js';

afterEach(() => vi.restoreAllMocks());
it('exports status counters, latency buckets and connection samples behind a separate token', async () => {
  const metric = createMetrics();
  metric.observeHttp('GET', 500, 0.2);
  metric.observeHttp('GET', 200, 0.05);
  metric.observeConnections({ connected: 3, running: 1 });
  const collect = vi.fn(async () => {});
  const app = express();
  app.get('/metrics', metricsHandler('operation-token-with-at-least-32-characters', collect, metric.registry));
  expect((await request(app).get('/metrics')).status).toBe(401);
  expect((await request(app).get('/metrics').set('Authorization', 'Bearer user-jwt')).status).toBe(401);
  expect(collect).not.toHaveBeenCalled();
  const response = await request(app).get('/metrics').set('Authorization', 'Bearer operation-token-with-at-least-32-characters');
  expect(response.status).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.text).toContain('huellas_http_requests_total{method="GET",status="500"} 1');
  expect(response.text).toContain('huellas_http_request_duration_seconds_count{method="GET"} 2');
  expect(response.text).toContain('huellas_mysql_connections{state="connected"} 3');
  metric.observeConnections(null);
  const unavailable = await metric.registry.metrics();
  expect(unavailable).toContain('huellas_mysql_metrics_up 0');
  expect(unavailable).not.toContain('state="connected"');
});
it('keeps metrics disabled if no sufficiently strong operation token is configured', async () => {
  for (const token of [undefined, 'short']) {
    const app = express();
    app.get('/metrics', metricsHandler(token, async () => {}, createMetrics().registry));
    expect((await request(app).get('/metrics')).status).toBe(404);
  }
});
it('rejects payloads containing arbitrary messages, URLs, stacks or unknown categories', async () => {
  const output = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const observe = vi.fn();
  const app = express();
  app.use(express.json());
  app.post('/client-errors', clientReportHandler(observe));
  for (const data of [
    { kind: 'render', message: 'private diagnosis' }, { kind: 'network', url: '/pets/private-id' },
    { kind: 'render', stack: 'private stack' }, { kind: 'private text' }, { kind: 'render', requestId: 'private data' },
  ]) expect((await request(app).post('/client-errors').send(data)).status).toBe(400);
  expect(observe).not.toHaveBeenCalled();
  expect(output).not.toHaveBeenCalled();
  expect((await request(app).post('/client-errors').send({ kind: 'render' })).status).toBe(204);
  expect(observe).toHaveBeenCalledWith('render');
  expect(output.mock.calls.flat().join('')).not.toContain('private');
});
it('bounds accepted reports globally without keeping visitor identifiers', async () => {
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const app = express();
  app.use(express.json());
  const observe = vi.fn();
  app.post('/client-errors', clientReportHandler(observe));
  for (let i = 0; i < 120; i++) expect((await request(app).post('/client-errors').send({ kind: 'runtime' })).status).toBe(204);
  expect((await request(app).post('/client-errors').send({ kind: 'runtime' })).status).toBe(429);
  expect(observe).toHaveBeenCalledTimes(120);
});

it('rejects malformed and oversized reports without forwarding parser errors', async () => {
  const app = express();
  const observe = vi.fn();
  app.post('/client-errors', express.json({ limit: '1kb' }), clientReportHandler(observe), clientReportParseError);
  expect((await request(app).post('/client-errors').set('Content-Type', 'application/json').send('{private')).status).toBe(400);
  expect((await request(app).post('/client-errors').send({ kind: 'runtime', message: 'x'.repeat(2000) })).status).toBe(413);
  expect(observe).not.toHaveBeenCalled();
});
