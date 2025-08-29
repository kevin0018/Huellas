import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { PrismaClient } from '@prisma/client';
import { PrismaConversationRepository } from '../repositories/PrismaConversationRepository.js';
import { PrismaMessageRepository } from '../repositories/PrismaMessageRepository.js';
import { CreateConversationCommandHandler } from '../../app/commands/CreateConversationCommandHandler.js';
import { SendMessageCommandHandler } from '../../app/commands/SendMessageCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from '../../app/commands/MarkMessageAsReadCommandHandler.js';
import { ArchiveConversationCommandHandler } from '../../app/commands/ArchiveConversationCommandHandler.js';
import { GetConversationsQueryHandler } from '../../app/queries/GetConversationsQueryHandler.js';
import { GetMessagesQueryHandler } from '../../app/queries/GetMessagesQueryHandler.js';
import { GetUnreadMessagesCountQueryHandler } from '../../app/queries/GetUnreadMessagesCountQueryHandler.js';

const prisma = new PrismaClient();
const conversationRepo = new PrismaConversationRepository(prisma);
const messageRepo = new PrismaMessageRepository(prisma);

const createConversationHandler = new CreateConversationCommandHandler(conversationRepo);
const sendMessageHandler = new SendMessageCommandHandler(messageRepo, conversationRepo);
const markAsReadHandler = new MarkMessageAsReadCommandHandler(messageRepo, conversationRepo);
const archiveConversationHandler = new ArchiveConversationCommandHandler(conversationRepo);
const getConversationsHandler = new GetConversationsQueryHandler(conversationRepo);
const getMessagesHandler = new GetMessagesQueryHandler(messageRepo);
const getUnreadCountHandler = new GetUnreadMessagesCountQueryHandler(messageRepo);

export class ChatController {
  // GET /conversations - List user conversations

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const conversations = await getConversationsHandler.handle({ userId });
      res.json(conversations);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener conversaciones', error: err });
    }
  }

  // POST /conversations - Create new conversation

  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { participantIds, title } = req.body;
      const createdBy = req.user.userId;
      const conversation = await createConversationHandler.handle({ participantIds, title, createdBy });
      res.status(201).json(conversation);
    } catch (err) {
      res.status(500).json({ message: 'Error al crear conversación', error: err });
    }
  }

  // GET /conversations/:id/messages - Obtain messages from conversation

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const messages = await getMessagesHandler.handle({ conversationId });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener mensajes', error: err });
    }
  }

  // POST /conversations/:id/messages - Send message

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const { content, type } = req.body;
      const senderId = req.user.userId;
      const message = await sendMessageHandler.handle({ conversationId, senderId, content, type });
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ message: 'Error al enviar mensaje', error: err });
    }
  }

  // PUT /messages/:id/read - Mark message as read

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = Number(req.params.id);
      const userId = req.user.userId;
      
      await markAsReadHandler.handle({ messageId, userId });
      res.json({ success: true, message: 'Message marked as read' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ message: 'Error marking message as read', error: errorMessage });
    }
  }

  // GET /messages/unread/count - Count unread messages

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const unreadCount = await getUnreadCountHandler.handle({ userId });
      res.json({ unreadCount });
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener cantidad de mensajes no leídos', error: err });
    }
  }

  // PUT /conversations/:id/archive - archive conversation

  async archiveConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const userId = req.user.userId;
      
      const conversation = await archiveConversationHandler.handle({ conversationId, userId });
      res.json({ conversation, message: 'Conversation archived successfully' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ message: 'Error archiving conversation', error: errorMessage });
    }
  }
}
