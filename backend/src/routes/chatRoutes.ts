import { Router } from 'express';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { ChatModule } from '../contexts/chat/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createChatRoutes({ controller }: ChatModule): Router {
  const router = Router();
  const requireChat = () => JwtMiddleware.requireCapability(Capability.USE_CHAT);

// GET /conversations - Lista conversaciones del usuario
  router.get('/conversations', ...requireChat(), (req, res) => controller.getConversations(req, res));

// POST /conversations - Crear nueva conversación
  router.post('/conversations', ...requireChat(), (req, res) => controller.createConversation(req, res));

// GET /conversations/:id/messages - Obtener mensajes de conversación
  router.get('/conversations/:id/messages', ...requireChat(), (req, res) => controller.getMessages(req, res));

// POST /conversations/:id/messages - Enviar mensaje
  router.post('/conversations/:id/messages', ...requireChat(), (req, res) => controller.sendMessage(req, res));

// PUT /messages/:id/read - Marcar mensaje como leído
  router.put('/messages/:id/read', ...requireChat(), (req, res) => controller.markAsRead(req, res));

// GET /messages/unread/count - Contar mensajes no leídos
  router.get('/messages/unread/count', ...requireChat(), (req, res) => controller.getUnreadCount(req, res));

// PUT /conversations/:id/archive - Archivar conversación
  router.put('/conversations/:id/archive', ...requireChat(), (req, res) => controller.archiveConversation(req, res));

  return router;
}
