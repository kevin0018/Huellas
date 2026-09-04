import { test, expect } from '@playwright/test';

const api = 'http://127.0.0.1:3001';

test('operational endpoints check real dependencies and disable caching', async ({ request }) => {
  for (const path of ['/live', '/health']) {
    const response = await request.get(`${api}${path}`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
    expect(response.headers()['cache-control']).toBe('no-store');
  }
  const ready = await request.get(`${api}/ready`);
  expect(ready.status()).toBe(200);
  expect(await ready.json()).toEqual({ status: 'ready', checks: { prisma: true, mysql: true, redis: true } });
  expect(ready.headers()['cache-control']).toBe('no-store');
});

test('CORS permits correlation and exposes the ID on denied API responses', async ({ request }) => {
  const origin = 'http://127.0.0.1:4173';
  const preflight = await request.fetch(`${api}/api/pets/1`, {
    method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'X-Request-ID,Authorization' },
  });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()['access-control-allow-headers']).toContain('X-Request-ID');
  const id = 'de6712c8-d2ae-4ee0-9c7a-c248a319c72d';
  const denied = await request.get(`${api}/api/pets/1`, { headers: { Origin: origin, 'X-Request-ID': id } });
  expect(denied.status()).toBe(401);
  expect(denied.headers()['x-request-id']).toBe(id);
  expect(denied.headers()['access-control-expose-headers']).toContain('X-Request-ID');
});
