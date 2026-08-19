import type { ExtendedError, Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtBlacklist } from '../../../auth/infra/services/JwtBlacklist.js';
import type { JwtPayload } from '../../../auth/infra/middleware/JwtMiddleware.js';
import type { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';
import type { SendMessageCommandHandler } from '../../app/commands/SendMessageCommandHandler.js';
import type { MarkMessageAsReadCommandHandler } from '../../app/commands/MarkMessageAsReadCommandHandler.js';

type AuthenticatedSocket = Socket & { data: { userId: number } };

export async function authenticateChatSocket(
  socket: Socket,
  next: (error?: ExtendedError) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth?.token;
    const secret = process.env.JWT_SECRET;
    if (typeof token !== 'string' || !secret || await JwtBlacklist.isBlacklisted(token)) {
      next(new Error('Unauthorized'));
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!Number.isInteger(decoded.userId) || decoded.userId <= 0) {
      next(new Error('Unauthorized'));
      return;
    }

    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
}

export class ChatSocketHandler {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly sendMessage: SendMessageCommandHandler,
    private readonly markMessageAsRead: MarkMessageAsReadCommandHandler,
  ) {}

  private async canAccessConversation(conversationId: number, userId: number): Promise<boolean> {
    const conversation = await this.conversationRepository.findById(conversationId);
    return conversation?.isParticipant(userId) ?? false;
  }

  handleConnection(io: Server): void {
    io.use(authenticateChatSocket);

    io.on('connection', (rawSocket: Socket) => {
      const socket = rawSocket as AuthenticatedSocket;
      const userId = socket.data.userId;
      socket.join(`user:${userId}`);

      socket.on('send-message', async (data: { conversationId: number; content: string; type?: string }) => {
        try {
          const message = await this.sendMessage.handle({
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            type: data.type
          });

          const conversation = await this.conversationRepository.findById(data.conversationId);
          conversation?.participantIds.forEach((participantId) => {
            io.to(`user:${participantId}`).emit('new-message', {
              id: message.id,
              conversationId: message.conversationId,
              senderId: message.senderId,
              content: message.content,
              type: message.type,
              createdAt: message.createdAt
            });
          });
        } catch {
          socket.emit('error', { message: 'Message operation not allowed' });
        }
      });

      socket.on('mark-read', async (data: { messageId: number }) => {
        try {
          await this.markMessageAsRead.handle({ messageId: data.messageId, userId });
          socket.emit('message-read', { messageId: data.messageId });
        } catch {
          socket.emit('error', { message: 'Message operation not allowed' });
        }
      });

      socket.on('join-conversation', async (data: { conversationId: number }) => {
        try {
          if (!await this.canAccessConversation(data.conversationId, userId)) {
            throw new Error('Access denied');
          }
          socket.join(`conversation:${data.conversationId}`);
          await this.conversationRepository.updateLastReadAt(data.conversationId, userId, new Date());
          socket.emit('joined-conversation', { conversationId: data.conversationId });
        } catch {
          socket.emit('error', { message: 'Conversation not found' });
        }
      });

      socket.on('leave-conversation', (data: { conversationId: number }) => {
        socket.leave(`conversation:${data.conversationId}`);
      });

      socket.on('typing', async (data: { conversationId: number; isTyping: boolean }) => {
        if (!await this.canAccessConversation(data.conversationId, userId)) return;
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
          userId,
          isTyping: data.isTyping
        });
      });
    });
  }
}
