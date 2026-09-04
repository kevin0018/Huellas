import express from 'express';
import { requestLogging } from './observability/requestLogging.js';
import { createDependencyReadiness } from './observability/dependencies.js';
import cors from 'cors';
import { testDbConnection } from './db/pool.js';
import { createRoutes } from './routes/index.js';
import { testRoutes } from './test-routes.js';
import { config } from './config/env.js';
import { createRateLimiter, errorHandler, notFoundHandler, securityHeaders } from './middleware/security.js';
import { openApiDocument } from './contracts/openapi.js';
import { createApplicationModules, type ApplicationModules } from './composition/createApplicationModules.js';
import { isOriginAllowed } from './config/originPolicy.js';

export async function buildApp(
  modules: ApplicationModules = createApplicationModules(),
  readiness = createDependencyReadiness(),
) {
  const app = express();
  const corsMiddleware = cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin, {
        allowedOrigins: config.corsOrigins,
        frontendPort: config.frontendPort,
        nodeEnv: config.nodeEnv,
      })) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  });
  app.disable('x-powered-by');
  app.use(requestLogging);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);
  // Base64 adds roughly 33% overhead to the documented 5 MB binary limit.
  // Keep the larger parser scoped exclusively to the private upload endpoint.
  app.use('/api/pets/:id/health-documents', express.json({ limit: '7mb' }));
  app.use(express.json({ limit: '100kb' }));

  // Liveness remains independent of external services; /health is the legacy alias.
  app.get(['/health', '/live'], (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });
  app.get('/ready', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    void readiness.status().then(result => {
      res.status(result.status === 'ready' ? 200 : 503).json(result);
    }).catch(next);
  });

  if (config.nodeEnv !== 'production') {
    app.get('/db-check', async (_req, res) => {
      try {
        await testDbConnection();
        res.json({ db: 'ok' });
      } catch {
        res.status(503).json({ db: 'error' });
      }
    });
  }

  // API routes
  app.use('/api', readiness.requireReady);
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/api/auth/login', createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts. Try again later.',
  }));
  app.use('/api', createRateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Too many requests. Try again shortly.',
  }));
  app.use('/api', createRoutes(modules));
  
  // Test routes (for development/testing)
  if (config.nodeEnv !== 'production') {
    app.use('/api/test', testRoutes);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
