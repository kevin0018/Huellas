import { createServer } from 'http';
import { logger } from './observability/logger.js';
import { createDependencyReadiness } from './observability/dependencies.js';
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
    const readiness = createDependencyReadiness();
    void RedisService.getInstance().connect().catch(error => logger.error('redis.connect_failed', error));
    const app = await buildApp(modules, readiness);
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

    io.use((_socket, next) => {
      void readiness.status().then(result => next(result.status === 'ready' ? undefined : new Error('Service temporarily unavailable'))).catch(next);
    });

    // Initialize SocketIO Service
    const socketService = SocketIOService.getInstance();
    socketService.setIO(io);

    // Initialize WebSocket handlers
    modules.chat.socket.handleConnection(io);

    httpServer.once('error', error => {
      logger.error('server.listen_failed', error);
      process.exit(1);
    });
    httpServer.listen(config.port, () => logger.info('server.listening'));

    let shuttingDown = false;
    const shutdown = async (_signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;
      readiness.drain();
      logger.info('server.draining');
      const deadline = setTimeout(() => {
        logger.error('server.shutdown_timeout');
        process.exit(1);
      }, 10_000);
      deadline.unref();
      // Socket.IO closes its connections and the attached HTTP server.
      io.close(() => {
        void Promise.allSettled([
          prisma.$disconnect(),
          RedisService.getInstance().disconnect(),
          dbPool.end(),
        ]).then(results => {
          clearTimeout(deadline);
          const failed = results.some(result => result.status === 'rejected');
          if (failed) logger.error('server.cleanup_failed');
          else logger.info('server.stopped');
          process.exit(failed ? 1 : 0);
        });
      });
    };

    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    logger.error('server.start_failed', error);
    process.exit(1);
  }
}

startServer();
