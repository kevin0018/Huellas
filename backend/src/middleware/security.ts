import { logger } from '../observability/logger.js';
import type { NextFunction, Request, Response } from 'express';

type RateLimitEntry = { count: number; resetAt: number };

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  const entries = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = entries.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : current;

    entry.count += 1;
    entries.set(key, entry);
    res.setHeader('RateLimit-Limit', String(options.max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, options.max - entry.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > options.max) {
      res.status(429).json({ error: options.message });
      return;
    }

    next();
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found', path: req.path });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof Error && error.message === 'Origin not allowed by CORS') {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  logger.error('http.unhandled_error', error);
  res.status(500).json({ error: 'Internal server error' });
}
