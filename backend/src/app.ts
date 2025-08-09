import express from 'express';
import { testDbConnection } from './db/pool.js';

export function buildApp() {
  const app = express();
  app.use(express.json());

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

  return app;
}