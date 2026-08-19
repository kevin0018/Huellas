import { Response } from 'express';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { CreateConversationCommandHandler } from '../../app/commands/CreateConversationCommandHandler.js';
import { SendMessageCommandHandler } from '../../app/commands/SendMessageCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from '../../app/commands/MarkMessageAsReadCommandHandler.js';
import { ArchiveConversationCommandHandler } from '../../app/commands/ArchiveConversationCommandHandler.js';
import { GetConversationsQueryHandler } from '../../app/queries/GetConversationsQueryHandler.js';
import { GetMessagesQueryHandler } from '../../app/queries/GetMessagesQueryHandler.js';
import { GetUnreadMessagesCountQueryHandler } from '../../app/queries/GetUnreadMessagesCountQueryHandler.js';
import { SocketIOService } from '../websocket/SocketIOService.js';
import type { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export interface ChatControllerDependencies {
  conversationRepository: ConversationRepository;
  createConversation: CreateConversationCommandHandler;
  sendMessage: SendMessageCommandHandler;
  markAsRead: MarkMessageAsReadCommandHandler;
  archiveConversation: ArchiveConversationCommandHandler;
  getConversations: GetConversationsQueryHandler;
  getMessages: GetMessagesQueryHandler;
  getUnreadCount: GetUnreadMessagesCountQueryHandler;
}

export class ChatController {
  constructor(private readonly dependencies: ChatControllerDependencies) {}

  private async canAccessConversation(conversationId: number, userId: number): Promise<boolean> {
    const conversation = await this.dependencies.conversationRepository.findById(conversationId);
    return conversation?.isParticipant(userId) ?? false;
  }

  // GET /conversations - List user conversations

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const conversations = await this.dependencies.getConversations.handle({ userId });
      
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
    } catch {
      res.status(500).json({ success: false, message: 'Error al obtener conversaciones' });
    }
  }

  // POST /conversations - Create new conversation

  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { participantIds, title } = req.body;
      const createdBy = req.user.userId;
      if (!Array.isArray(participantIds) || participantIds.length === 0 || participantIds.length > 20) {
        res.status(400).json({ success: false, message: 'Invalid participants' });
        return;
      }
      const uniqueParticipantIds = [...new Set(participantIds.map(Number))];
      if (uniqueParticipantIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        res.status(400).json({ success: false, message: 'Invalid participants' });
        return;
      }
      const conversation = await this.dependencies.createConversation.handle({ participantIds: uniqueParticipantIds, title, createdBy });
      
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
    } catch {
      res.status(400).json({ success: false, message: 'Unable to create conversation' });
    }
  }

  // GET /conversations/:id/messages - Obtain messages from conversation

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      if (!Number.isInteger(conversationId) || !await this.canAccessConversation(conversationId, req.user.userId)) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }
      const messages = await this.dependencies.getMessages.handle({ conversationId, userId: req.user.userId });
      
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
    } catch {
      res.status(500).json({ success: false, message: 'Error al obtener mensajes' });
    }
  }

  // POST /conversations/:id/messages - Send message

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const { content, type } = req.body;
      const senderId = req.user.userId;
      if (typeof content !== 'string' || content.trim().length === 0 || content.length > 5000) {
        res.status(400).json({ success: false, message: 'Message content must contain between 1 and 5000 characters' });
        return;
      }
      
      const message = await this.dependencies.sendMessage.handle({ conversationId, senderId, content: content.trim(), type });
      
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
        const conversation = await this.dependencies.conversationRepository.findById(conversationId);
        if (conversation) {
          const socketService = SocketIOService.getInstance();
          socketService.emitNewMessage(conversationId, conversation.participantIds, messageDTO);
        }
      } catch (socketError) {
        console.warn('[ChatController] Failed to broadcast via Socket.IO:', socketError);
        // Don't fail the request if socket broadcast fails
      }
      
      res.status(201).json({ success: true, data: messageDTO });
    } catch {
      res.status(404).json({ success: false, message: 'Conversation not found' });
    }
  }

  // PUT /messages/:id/read - Mark message as read

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = Number(req.params.id);
      const userId = req.user.userId;
      
      await this.dependencies.markAsRead.handle({ messageId, userId });
      res.json({ success: true, message: 'Message marked as read' });
    } catch {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  }

  // GET /messages/unread/count - Count unread messages

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const unreadCount = await this.dependencies.getUnreadCount.handle({ userId });
      res.json({ success: true, data: { count: unreadCount } });
    } catch {
      res.status(500).json({ success: false, message: 'Error al obtener cantidad de mensajes no leídos' });
    }
  }

  // PUT /conversations/:id/archive - archive conversation

  async archiveConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = Number(req.params.id);
      const userId = req.user.userId;
      
      const conversation = await this.dependencies.archiveConversation.handle({ conversationId, userId });
      res.json({ success: true, data: { conversation, message: 'Conversation archived successfully' } });
    } catch {
      res.status(404).json({ success: false, message: 'Conversation not found' });
    }
  }
}
