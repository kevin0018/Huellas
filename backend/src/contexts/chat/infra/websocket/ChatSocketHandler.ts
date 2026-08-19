import type { ExtendedError, Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../db/prisma.js';
import { JwtBlacklist } from '../../../auth/infra/services/JwtBlacklist.js';
import type { JwtPayload } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { PrismaMessageRepository } from '../repositories/PrismaMessageRepository.js';
import { PrismaConversationRepository } from '../repositories/PrismaConversationRepository.js';
import { SendMessageCommandHandler } from '../../app/commands/SendMessageCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from '../../app/commands/MarkMessageAsReadCommandHandler.js';

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
  private static messageRepo = new PrismaMessageRepository(prisma);
  private static conversationRepo = new PrismaConversationRepository(prisma);
  private static sendMessageHandler = new SendMessageCommandHandler(
    ChatSocketHandler.messageRepo,
    ChatSocketHandler.conversationRepo
  );
  private static markMessageAsReadHandler = new MarkMessageAsReadCommandHandler(
    ChatSocketHandler.messageRepo,
    ChatSocketHandler.conversationRepo
  );

  private static async canAccessConversation(conversationId: number, userId: number): Promise<boolean> {
    const conversation = await ChatSocketHandler.conversationRepo.findById(conversationId);
    return conversation?.isParticipant(userId) ?? false;
  }

  static handleConnection(io: Server): void {
    io.use(authenticateChatSocket);

    io.on('connection', (rawSocket: Socket) => {
      const socket = rawSocket as AuthenticatedSocket;
      const userId = socket.data.userId;
      socket.join(`user:${userId}`);

      socket.on('send-message', async (data: { conversationId: number; content: string; type?: string }) => {
        try {
          const message = await ChatSocketHandler.sendMessageHandler.handle({
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            type: data.type
          });

          const conversation = await ChatSocketHandler.conversationRepo.findById(data.conversationId);
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
          await ChatSocketHandler.markMessageAsReadHandler.handle({ messageId: data.messageId, userId });
          socket.emit('message-read', { messageId: data.messageId });
        } catch {
          socket.emit('error', { message: 'Message operation not allowed' });
        }
      });

      socket.on('join-conversation', async (data: { conversationId: number }) => {
        try {
          if (!await ChatSocketHandler.canAccessConversation(data.conversationId, userId)) {
            throw new Error('Access denied');
          }
          socket.join(`conversation:${data.conversationId}`);
          await ChatSocketHandler.conversationRepo.updateLastReadAt(data.conversationId, userId, new Date());
          socket.emit('joined-conversation', { conversationId: data.conversationId });
        } catch {
          socket.emit('error', { message: 'Conversation not found' });
        }
      });

      socket.on('leave-conversation', (data: { conversationId: number }) => {
        socket.leave(`conversation:${data.conversationId}`);
      });

      socket.on('typing', async (data: { conversationId: number; isTyping: boolean }) => {
        if (!await ChatSocketHandler.canAccessConversation(data.conversationId, userId)) return;
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
          userId,
          isTyping: data.isTyping
        });
      });
    });
  }
}
