import express from 'express';
import { testDbConnection } from './db/pool.js';
import { createRoutes } from './routes/index.js';
import { testRoutes } from './test-routes.js';

export function buildApp() {
  const app = express();
  app.use(express.json());

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