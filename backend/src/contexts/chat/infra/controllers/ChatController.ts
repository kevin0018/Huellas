import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { PrismaClient } from '@prisma/client';
import { PrismaConversationRepository } from '../repositories/PrismaConversationRepository.js';
import { PrismaMessageRepository } from '../repositories/PrismaMessageRepository.js';
import { GetConversationsByUserHandler } from '../../app/queries/GetConversationsByUser/GetConversationsByUserHandler.js';
import { CreateConversationHandler } from '../../app/commands/CreateConversation/CreateConversationHandler.js';
import { GetMessagesByConversationHandler } from '../../app/queries/GetMessagesByConversation/GetMessagesByConversationHandler.js';
import { SendMessageHandler } from '../../app/commands/SendMessage/SendMessageHandler.js';
// Puedes agregar más handlers según los vayas implementando

const prisma = new PrismaClient();
const conversationRepo = new PrismaConversationRepository(prisma);
const messageRepo = new PrismaMessageRepository(prisma);

const getConversationsHandler = new GetConversationsByUserHandler(conversationRepo);
const createConversationHandler = new CreateConversationHandler(conversationRepo);
const getMessagesHandler = new GetMessagesByConversationHandler(messageRepo);
const sendMessageHandler = new SendMessageHandler(messageRepo);

export class ChatController {
  // GET /conversations - Lista conversaciones del usuario

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const userId = req.user.userId;
      const conversations = await getConversationsHandler.execute({ userId });
      res.json(conversations);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener conversaciones', error: err });
    }
  }

  // POST /conversations - Crear nueva conversación

  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { participantIds, title } = req.body;
  const createdBy = req.user.userId;
      const conversation = await createConversationHandler.execute({ participantIds, title, createdBy });
      res.status(201).json(conversation);
    } catch (err) {
      res.status(500).json({ message: 'Error al crear conversación', error: err });
    }
  }

  // GET /conversations/:id/messages - Obtener mensajes de conversación

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const messages = await getMessagesHandler.execute({ conversationId });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener mensajes', error: err });
    }
  }

  // POST /conversations/:id/messages - Enviar mensaje

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const { content, type } = req.body;
  const senderId = req.user.userId;
      const message = await sendMessageHandler.execute({ conversationId, senderId, content, type });
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ message: 'Error al enviar mensaje', error: err });
    }
  }

  // PUT /messages/:id/read - Marcar mensaje como leído

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    // TODO: Implementar MarkMessageAsReadHandler y lógica real
    res.status(501).json({ message: 'No implementado' });
  }

  // GET /messages/unread/count - Contar mensajes no leídos

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    // TODO: Implementar GetUnreadMessagesCountHandler y lógica real
    res.status(501).json({ message: 'No implementado' });
  }
}
