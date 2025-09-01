import { Response } from 'express';
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
import { SocketIOService } from '../websocket/SocketIOService.js';

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
      
      // Transform entities to DTOs using getters
      const conversationDTOs = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        status: conv.status,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        createdBy: conv.createdBy,
        participantIds: conv.participantIds,
        participants: conv.participants,
        isArchived: conv.status === 'ARCHIVED',
        unreadCount: 0 // TODO: Implement unread count
      }));
      
      res.json({ success: true, data: conversationDTOs });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error al obtener conversaciones', error: err });
    }
  }

  // POST /conversations - Create new conversation

  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { participantIds, title } = req.body;
      const createdBy = req.user.userId;
      const conversation = await createConversationHandler.handle({ participantIds, title, createdBy });
      
      // Transform entity to DTO using getters
      const conversationDTO = {
        id: conversation.id,
        title: conversation.title,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        createdBy: conversation.createdBy,
        participantIds: conversation.participantIds,
        participants: conversation.participants,
        isArchived: conversation.status === 'ARCHIVED',
        unreadCount: 0
      };
      
      res.status(201).json({ success: true, data: conversationDTO });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error al crear conversación', error: err });
    }
  }

  // GET /conversations/:id/messages - Obtain messages from conversation

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const messages = await getMessagesHandler.handle({ conversationId });
      
      // Transform entities to DTOs using getters
      const messageDTOs = messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        editedAt: msg.editedAt,
        isRead: false // TODO: Implement proper read status
      }));
      
      res.json({ success: true, data: messageDTOs });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error al obtener mensajes', error: err });
    }
  }

  // POST /conversations/:id/messages - Send message

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const { content, type } = req.body;
      const senderId = req.user.userId;
      
      const message = await sendMessageHandler.handle({ conversationId, senderId, content, type });
      
      // Transform entity to DTO using getters
      const messageDTO = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        editedAt: message.editedAt,
        isRead: false // Default to false for new messages
      };

      // Notify via Socket.IO to all conversation participants
      try {
        const conversation = await conversationRepo.findById(conversationId);
        if (conversation) {
          const socketService = SocketIOService.getInstance();
          socketService.emitNewMessage(conversationId, conversation.participantIds, messageDTO);
        }
      } catch (socketError) {
        console.warn('[ChatController] Failed to broadcast via Socket.IO:', socketError);
        // Don't fail the request if socket broadcast fails
      }
      
      res.status(201).json({ success: true, data: messageDTO });
    } catch (err) {
      console.error('[ChatController] Error sending message:', err);
      res.status(500).json({ success: false, message: 'Error al enviar mensaje', error: err instanceof Error ? err.message : 'Unknown error' });
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
      res.status(400).json({ success: false, message: 'Error marking message as read', error: errorMessage });
    }
  }

  // GET /messages/unread/count - Count unread messages

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const unreadCount = await getUnreadCountHandler.handle({ userId });
      res.json({ success: true, data: { unreadCount } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error al obtener cantidad de mensajes no leídos', error: err });
    }
  }

  // PUT /conversations/:id/archive - archive conversation

  async archiveConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const userId = req.user.userId;
      
      const conversation = await archiveConversationHandler.handle({ conversationId, userId });
      res.json({ success: true, data: { conversation, message: 'Conversation archived successfully' } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ success: false, message: 'Error archiving conversation', error: errorMessage });
    }
  }
}
