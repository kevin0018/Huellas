import { describe, expect, it } from 'vitest';
import { isOriginAllowed, type OriginPolicy } from './originPolicy.js';

const developmentPolicy: OriginPolicy = {
  allowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  frontendPort: 5173,
  nodeEnv: 'development',
};

describe('isOriginAllowed', () => {
  it('accepts configured origins and requests without a browser origin', () => {
    expect(isOriginAllowed(undefined, developmentPolicy)).toBe(true);
    expect(isOriginAllowed('http://localhost:5173', developmentPolicy)).toBe(true);
  });

  it.each([
    'http://10.0.0.25:5173',
    'http://172.16.0.25:5173',
    'http://172.31.255.25:5173',
    'http://192.168.1.135:5173',
  ])('accepts a private-network frontend in development: %s', (origin) => {
    expect(isOriginAllowed(origin, developmentPolicy)).toBe(true);
  });

  it.each([
    'http://192.168.1.135:3000',
    'http://172.32.0.25:5173',
    'https://example.com:5173',
    'not-an-origin',
  ])('rejects origins outside the development policy: %s', (origin) => {
    expect(isOriginAllowed(origin, developmentPolicy)).toBe(false);
  });

  it('requires explicit origins in production', () => {
    expect(isOriginAllowed('http://192.168.1.135:5173', {
      ...developmentPolicy,
      nodeEnv: 'production',
    })).toBe(false);
  });
});
