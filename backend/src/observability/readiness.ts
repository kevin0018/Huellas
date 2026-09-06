import type { RequestHandler } from 'express';

type Probe = () => Promise<unknown>;
export type DependencyChecks = Record<'prisma' | 'mysql' | 'redis', Probe>;
export type Readiness = { status: 'ready' | 'not_ready'; checks: Record<keyof DependencyChecks, boolean> };

/** Share probes across callers; a timed-out probe must settle before it can run again. */
export function createReadiness(checks: DependencyChecks, timeoutMs = 1500, cacheMs = 1000) {
  let draining = false;
  let cached: Readiness | undefined;
  let expiresAt = 0;
  let active: Promise<Readiness> | undefined;
  const pending = new Map<keyof DependencyChecks, Promise<boolean>>();
  const unavailable = (): Readiness => ({ status: 'not_ready', checks: { prisma: false, mysql: false, redis: false } });

  async function probe(name: keyof DependencyChecks): Promise<boolean> {
    let operation = pending.get(name);
    if (!operation) {
      operation = Promise.resolve().then(checks[name]).then(() => true, () => false);
      pending.set(name, operation);
      void operation.then(() => pending.delete(name));
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([operation, new Promise<boolean>(resolve => {
        timer = setTimeout(() => resolve(false), timeoutMs);
      })]);
    } finally { clearTimeout(timer); }
  }

  async function status(): Promise<Readiness> {
    if (draining) return unavailable();
    if (cached && Date.now() < expiresAt) return cached;
    if (!active) {
      active = Promise.all([probe('prisma'), probe('mysql'), probe('redis')]).then(([prisma, mysql, redis]) => {
        cached = { status: prisma && mysql && redis ? 'ready' : 'not_ready', checks: { prisma, mysql, redis } };
        expiresAt = Date.now() + cacheMs;
        return cached;
      }).finally(() => { active = undefined; });
    }
    const result = await active;
    return draining ? unavailable() : result;
  }

  const requireReady: RequestHandler = (_req, res, next) => {
    void status().then(result => {
      if (result.status === 'ready') { next(); return; }
      res.setHeader('Retry-After', '1');
      res.status(503).json({ error: 'Service temporarily unavailable' });
    }).catch(next);
  };

  return { status, requireReady, drain: () => { draining = true; } };
}
