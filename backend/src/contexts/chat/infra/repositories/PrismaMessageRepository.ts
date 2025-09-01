import { PrismaClient } from '@prisma/client';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Message | null> {
    const data = await this.prisma.message.findUnique({ where: { id } });
    if (!data) return null;
    return Message.fromDatabase(data);
  }

  async findByConversationId(conversationId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const data = await this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' }, // Changed to 'asc' for natural chat flow (oldest first, newest last)
      take: limit,
      skip: offset,
    });
    return data.map(m => Message.fromDatabase(m));
  }

  async save(message: Message): Promise<Message> {
    if (message.id === 0) {
      // Create new message
      const data = await this.prisma.message.create({
        data: {
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          content: message.content,
          type: message.type,
        },
      });
      return Message.fromDatabase(data);
    } else {
      // Update existing message
      const data = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          content: message.content,
          type: message.type,
          updated_at: new Date(),
          edited_at: message.editedAt,
        },
      });
      return Message.fromDatabase(data);
    }
  }

  async delete(id: number): Promise<void> {
    await this.prisma.message.delete({ where: { id } });
  }

  async getUnreadCount(userId: number): Promise<number> {
    // Get all conversations where the user is a participant
    const userConversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { user_id: userId }
        }
      },
      include: {
        participants: {
          where: { user_id: userId },
          select: { last_read_at: true }
        }
      }
    });

    if (userConversations.length === 0) {
      return 0;
    }

    let totalUnreadCount = 0;

    // For each conversation, count messages sent after the user's last_read_at timestamp
    for (const conversation of userConversations) {
      const participant = conversation.participants[0];
      const lastReadAt = participant?.last_read_at;

      const unreadInConversation = await this.prisma.message.count({
        where: {
          conversation_id: conversation.id,
          sender_id: { not: userId }, // Exclude messages sent by the user
          created_at: lastReadAt ? { gt: lastReadAt } : undefined, // Messages after last read, or all if never read
        }
      });

      totalUnreadCount += unreadInConversation;
    }

    return totalUnreadCount;
  }
}
