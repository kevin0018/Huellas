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
      orderBy: { created_at: 'desc' },
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
    // This would require a read_at field or similar to track read status
    // For now, returning 0 as placeholder
    return 0;
  }
}
