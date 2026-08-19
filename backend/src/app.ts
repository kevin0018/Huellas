import express from 'express';
import cors from 'cors';
import { testDbConnection } from './db/pool.js';
import { createRoutes } from './routes/index.js';
import { testRoutes } from './test-routes.js';
import { RedisService } from './config/RedisService.js';
import { config } from './config/env.js';
import { createRateLimiter, errorHandler, notFoundHandler, securityHeaders } from './middleware/security.js';
import { openApiDocument } from './contracts/openapi.js';

export async function buildApp() {
  const app = express();
  const corsMiddleware = cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);
  // Base64 adds roughly 33% overhead to the documented 5 MB binary limit.
  // Keep the larger parser scoped exclusively to the private upload endpoint.
  app.use('/api/pets/:id/health-documents', express.json({ limit: '7mb' }));
  app.use(express.json({ limit: '100kb' }));

  // Initialize Redis connection
  try {
    const redisService = RedisService.getInstance();
    await redisService.connect();
  } catch (error) {
    console.warn('Redis connection failed!!!, using memory fallback:', error);
  }

  // Health check routes
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
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
  console.log('Setting up API routes...');
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
  app.use('/api', createRoutes());
  
  // Test routes (for development/testing)
  if (config.nodeEnv !== 'production') {
    app.use('/api/test', testRoutes);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
