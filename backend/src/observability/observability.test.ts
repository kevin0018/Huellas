import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger.js';
import { requestLogging } from './requestLogging.js';
import { createReadiness } from './readiness.js';

const firstId = 'de6712c8-d2ae-4ee0-9c7a-c248a319c72d';
const secondId = 'b5d1923c-8342-4f90-94d8-cd0fd121c927';
afterEach(() => { vi.restoreAllMocks(); });

describe('private request logging', () => {
  it('correlates concurrent responses and nested async errors without logging sensitive content', async () => {
    const lines: string[] = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(chunk => { lines.push(String(chunk)); return true; });
    vi.spyOn(process.stderr, 'write').mockImplementation(chunk => { lines.push(String(chunk)); return true; });
    const app = express();
    app.use(requestLogging, express.json());
    app.post('/api/pets/:id', async (req, res) => {
      await new Promise(resolve => setTimeout(resolve, req.params.id === 'private-pet' ? 15 : 1));
      logger.error('pet.update_failed', Object.assign(new Error('private-diagnosis'), { code: 'P2002', query: 'private-query' }));
      res.status(500).json({ error: 'Internal server error' });
    });
    const responses = await Promise.all([firstId, secondId].map((id, index) => request(app)
      .post(`/api/pets/${index ? 'other-private-pet' : 'private-pet'}?token=private-share`)
      .set('X-Request-ID', id).set('Authorization', 'Bearer private-token')
      .send({ password: 'private-password', notes: 'private-health-note' })));
    expect(responses.map(response => response.headers['x-request-id'])).toEqual([firstId, secondId]);
    expect(lines.join('')).not.toContain('private-');
    const records = lines.map(line => JSON.parse(line));
    for (const id of [firstId, secondId]) {
      expect(records.filter(record => record.requestId === id)).toEqual(expect.arrayContaining([
        expect.objectContaining({ event: 'pet.update_failed', errorCode: 'P2002' }),
        expect.objectContaining({ event: 'http.request', route: '/api/pets/:id', method: 'POST', status: 500, durationMs: expect.any(Number) }),
      ]));
      expect(records.filter(record => record.requestId === id && record.event === 'http.request')).toHaveLength(1);
    }
  });

  it('replaces arbitrary correlation headers and does not log unknown URL paths', async () => {
    const output = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const app = express();
    app.use(requestLogging);
    const response = await request(app).get('/private-email@example.test').set('X-Request-ID', 'private-note');
    expect(response.headers['x-request-id']).toMatch(/^[\da-f-]{36}$/);
    expect(output.mock.calls.flat().join('')).not.toContain('private-');
    expect(JSON.parse(String(output.mock.calls[0][0]))).toMatchObject({ route: 'unmatched', status: 404 });
  });
});

describe('dependency readiness', () => {
  it('returns 503 without running business handlers, while liveness stays available, then recovers', async () => {
    let healthy = false;
    const readiness = createReadiness({ prisma: async () => {}, mysql: async () => {}, redis: async () => {
      if (!healthy) throw new Error('redis://private-password@internal');
    } }, 20, 0);
    const handler = vi.fn((_req, res) => res.json({ ok: true }));
    const app = express();
    app.get('/live', (_req, res) => res.json({ status: 'ok' }));
    app.get('/ready', async (_req, res) => {
      const result = await readiness.status();
      res.status(result.status === 'ready' ? 200 : 503).json(result);
    });
    app.use('/api', readiness.requireReady);
    app.get('/api/pets', handler);
    expect((await request(app).get('/live')).status).toBe(200);
    expect((await request(app).get('/ready')).body).toEqual({ status: 'not_ready', checks: { prisma: true, mysql: true, redis: false } });
    expect((await request(app).get('/api/pets')).status).toBe(503);
    expect(handler).not.toHaveBeenCalled();
    healthy = true;
    expect((await request(app).get('/ready')).status).toBe(200);
    expect((await request(app).get('/api/pets')).status).toBe(200);
    readiness.drain();
    expect((await request(app).get('/api/pets')).status).toBe(503);
    expect((await request(app).get('/live')).status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });

  it.each(['prisma', 'mysql', 'redis'] as const)('fails readiness when %s is unavailable', async dependency => {
    const checks = { prisma: async () => {}, mysql: async () => {}, redis: async () => {} };
    checks[dependency] = async () => { throw new Error('private failure'); };
    expect(await createReadiness(checks).status()).toMatchObject({ status: 'not_ready', checks: { [dependency]: false } });
  });

  it('bounds hanging probes and shares work without accumulating database operations', async () => {
    let release: () => void = () => {};
    const prisma = vi.fn(() => new Promise<void>(resolve => { release = resolve; }));
    const readiness = createReadiness({ prisma, mysql: async () => {}, redis: async () => {} }, 10, 0);
    const results = await Promise.all([readiness.status(), readiness.status(), readiness.status()]);
    expect(results.every(result => result.status === 'not_ready')).toBe(true);
    await readiness.status();
    expect(prisma).toHaveBeenCalledOnce();
    release();
    await Promise.resolve();
  });

  it('does not become ready if shutdown starts during dependency checks', async () => {
    let release: () => void = () => {};
    const readiness = createReadiness({ prisma: () => new Promise<void>(resolve => { release = resolve; }), mysql: async () => {}, redis: async () => {} });
    const result = readiness.status();
    await Promise.resolve();
    readiness.drain();
    release();
    expect(await result).toMatchObject({ status: 'not_ready' });
  });
});
