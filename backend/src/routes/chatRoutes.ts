import { Router } from 'express';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { ChatModule } from '../contexts/chat/index.js';

export function createChatRoutes({ controller }: ChatModule): Router {
  const router = Router();
  const requireAuthenticated = JwtMiddleware.requireAuthenticated;

// GET /conversations - Lista conversaciones del usuario
  router.get('/conversations', requireAuthenticated(), (req, res) => controller.getConversations(req, res));

// POST /conversations - Crear nueva conversación
  router.post('/conversations', requireAuthenticated(), (req, res) => controller.createConversation(req, res));

// GET /conversations/:id/messages - Obtener mensajes de conversación
  router.get('/conversations/:id/messages', requireAuthenticated(), (req, res) => controller.getMessages(req, res));

// POST /conversations/:id/messages - Enviar mensaje
  router.post('/conversations/:id/messages', requireAuthenticated(), (req, res) => controller.sendMessage(req, res));

// PUT /messages/:id/read - Marcar mensaje como leído
  router.put('/messages/:id/read', requireAuthenticated(), (req, res) => controller.markAsRead(req, res));

// GET /messages/unread/count - Contar mensajes no leídos
  router.get('/messages/unread/count', requireAuthenticated(), (req, res) => controller.getUnreadCount(req, res));

// PUT /conversations/:id/archive - Archivar conversación
  router.put('/conversations/:id/archive', requireAuthenticated(), (req, res) => controller.archiveConversation(req, res));

  return router;
}
