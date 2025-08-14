import { buildApp } from './app.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    const app = await buildApp();
    app.listen(config.port, () => {
      console.log(`API running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();