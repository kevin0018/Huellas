import { createServer } from 'http';
import { Server } from 'socket.io';
import { buildApp } from './app.js';
import { config } from './config/env.js';
import { SocketIOService } from './contexts/chat/infra/websocket/SocketIOService.js';
import { prisma } from './db/prisma.js';
import { RedisService } from './config/RedisService.js';
import { dbPool } from './db/pool.js';
import { createApplicationModules } from './composition/createApplicationModules.js';
import { isOriginAllowed } from './config/originPolicy.js';

async function startServer() {
  try {
    const modules = createApplicationModules();
    const app = await buildApp(modules);
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
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
        methods: ["GET", "POST"]
      }
    });

    // Initialize SocketIO Service
    const socketService = SocketIOService.getInstance();
    socketService.setIO(io);

    // Initialize WebSocket handlers
    modules.chat.socket.handleConnection(io);

    httpServer.listen(config.port, () => {
      console.log(`API running on port ${config.port}`);
      console.log(`WebSocket server initialized`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}; shutting down`);
      io.close();
      httpServer.close(async () => {
        await Promise.allSettled([
          prisma.$disconnect(),
          RedisService.getInstance().disconnect(),
          dbPool.end(),
        ]);
        process.exit(0);
      });
    };

    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
