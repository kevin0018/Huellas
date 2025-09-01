import { Router } from 'express';
import { ChatController } from '../contexts/chat/infra/controllers/ChatController.js';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';

const router = Router();
const chatController = new ChatController();
const requireAuthenticated = JwtMiddleware.requireAuthenticated;

// GET /conversations - Lista conversaciones del usuario
router.get('/conversations', requireAuthenticated(), (req, res) => chatController.getConversations(req, res));

// POST /conversations - Crear nueva conversación
router.post('/conversations', requireAuthenticated(), (req, res) => chatController.createConversation(req, res));

// GET /conversations/:id/messages - Obtener mensajes de conversación
router.get('/conversations/:id/messages', requireAuthenticated(), (req, res) => chatController.getMessages(req, res));

// POST /conversations/:id/messages - Enviar mensaje
router.post('/conversations/:id/messages', requireAuthenticated(), (req, res) => chatController.sendMessage(req, res));

// PUT /messages/:id/read - Marcar mensaje como leído
router.put('/messages/:id/read', requireAuthenticated(), (req, res) => chatController.markAsRead(req, res));

// GET /messages/unread/count - Contar mensajes no leídos
router.get('/messages/unread/count', requireAuthenticated(), (req, res) => chatController.getUnreadCount(req, res));

// PUT /conversations/:id/archive - Archivar conversación
router.put('/conversations/:id/archive', requireAuthenticated(), (req, res) => chatController.archiveConversation(req, res));

export default router;
