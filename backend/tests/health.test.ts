import request from 'supertest';
import { buildApp } from '../src/app.js';
import { describe, it, expect } from 'vitest';

describe('GET /health', () => {
  it('returns ok status', async () => {
    const app = buildApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('ts');
  });
});