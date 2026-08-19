import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { createRateLimiter, securityHeaders } from './security.js';

function createResponse() {
  const state: { headers: Record<string, string>; status?: number; body?: unknown } = { headers: {} };
  const response = {
    setHeader(name: string, value: string) {
      state.headers[name.toLowerCase()] = value;
      return response;
    },
    status(code: number) {
      state.status = code;
      return response;
    },
    json(body: unknown) {
      state.body = body;
      return response;
    },
  } as unknown as Response;

  return { response, state };
}

describe('HTTP security middleware', () => {
  it('sets the baseline response headers', () => {
    const { response, state } = createResponse();
    const next = vi.fn() as NextFunction;

    securityHeaders({} as Request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(state.headers['x-content-type-options']).toBe('nosniff');
    expect(state.headers['x-frame-options']).toBe('DENY');
    expect(state.headers['referrer-policy']).toBe('no-referrer');
  });

  it('rejects requests after the configured limit', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1, message: 'Rate limited' });
    const request = { ip: '127.0.0.1', socket: {} } as Request;
    const first = createResponse();
    const second = createResponse();
    const next = vi.fn() as NextFunction;

    limiter(request, first.response, next);
    limiter(request, second.response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(second.state.status).toBe(429);
    expect(second.state.body).toEqual({ error: 'Rate limited' });
    expect(second.state.headers['ratelimit-remaining']).toBe('0');
  });
});
