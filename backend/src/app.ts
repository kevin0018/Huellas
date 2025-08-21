import express from 'express';
import cors from 'cors';
import { testDbConnection } from './db/pool.js';
import { createRoutes } from './routes/index.js';
import { testRoutes } from './test-routes.js';
import { RedisService } from './config/RedisService.js';

export async function buildApp() {
  const app = express();
  app.use(cors());
  app.options('*', cors());
  app.use(express.json());

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

  app.get('/db-check', async (_req, res) => {
    try {
      await testDbConnection();
      res.json({ db: 'ok' });
    } catch (e: any) {
      res.status(500).json({ db: 'error', message: e.message });
    }
  });

  // API routes
  console.log('Setting up API routes...');
  app.use('/api', createRoutes());
  
  // Test routes (for development/testing)
  app.use('/api/test', testRoutes);

  return app;
}