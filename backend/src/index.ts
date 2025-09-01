import { createServer } from 'http';
import { Server } from 'socket.io';
import { buildApp } from './app.js';
import { config } from './config/env.js';
import { ChatSocketHandler } from './contexts/chat/infra/websocket/ChatSocketHandler.js';
import { SocketIOService } from './contexts/chat/infra/websocket/SocketIOService.js';

async function startServer() {
  try {
    const app = await buildApp();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize SocketIO Service
    const socketService = SocketIOService.getInstance();
    socketService.setIO(io);

    // Initialize WebSocket handlers
    ChatSocketHandler.handleConnection(io);

    httpServer.listen(config.port, () => {
      console.log(`API running on port ${config.port}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();