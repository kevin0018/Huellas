import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PrismaMessageRepository } from '../repositories/PrismaMessageRepository.js';
import { PrismaConversationRepository } from '../repositories/PrismaConversationRepository.js';
import { SendMessageCommandHandler } from '../../app/commands/SendMessageCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from '../../app/commands/MarkMessageAsReadCommandHandler.js';

export class ChatSocketHandler {
  private static prisma = new PrismaClient();
  private static messageRepo = new PrismaMessageRepository(ChatSocketHandler.prisma);
  private static conversationRepo = new PrismaConversationRepository(ChatSocketHandler.prisma);
  private static sendMessageHandler = new SendMessageCommandHandler(
    ChatSocketHandler.messageRepo,
    ChatSocketHandler.conversationRepo
  );
  private static markMessageAsReadHandler = new MarkMessageAsReadCommandHandler(
    ChatSocketHandler.messageRepo,
    ChatSocketHandler.conversationRepo
  );

  static handleConnection(io: Server): void {
    io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);

      // Join user to their personal room
      socket.on('join-user-room', (userId: number) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room user:${userId}`);
      });

      // Handle new message
      socket.on('send-message', async (data: { conversationId: number; senderId: number; content: string; type?: string }) => {
        try {
          const message = await ChatSocketHandler.sendMessageHandler.handle({
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            type: data.type
          });

          // Get conversation to find participants
          const conversation = await ChatSocketHandler.conversationRepo.findById(data.conversationId);
          if (conversation) {
            // Emit to all participants
            conversation.participantIds.forEach(participantId => {
              io.to(`user:${participantId}`).emit('new-message', {
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                content: message.content,
                type: message.type,
                createdAt: message.createdAt
              });
            });
          }
        } catch {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle message read
      socket.on('mark-read', async (data: { messageId: number; userId: number }) => {
        try {
          await ChatSocketHandler.markMessageAsReadHandler.handle({
            messageId: data.messageId,
            userId: data.userId
          });
          socket.emit('message-read', { messageId: data.messageId });
        } catch {
          socket.emit('error', { message: 'Failed to mark message as read' });
        }
      });

      // Handle joining a conversation (auto-mark messages as read)
      socket.on('join-conversation', async (data: { conversationId: number; userId: number }) => {
        try {
          socket.join(`conversation:${data.conversationId}`);
          
          // Update last_read_at timestamp for this user in this conversation
          await ChatSocketHandler.conversationRepo.updateLastReadAt(
            data.conversationId, 
            data.userId, 
            new Date()
          );
          
          socket.emit('joined-conversation', { conversationId: data.conversationId });
        } catch {
          socket.emit('error', { message: 'Failed to join conversation' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data: { conversationId: number; userId: number; isTyping: boolean }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
}
