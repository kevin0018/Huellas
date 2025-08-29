import { PrismaClient } from '@prisma/client';
import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Conversation | null> {
    const data = await this.prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!data) return null;
    return Conversation.fromDatabase(data);
  }

  async findByParticipant(userId: number): Promise<Conversation[]> {
    const data = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { user_id: userId },
        },
      },
      include: { participants: true },
      orderBy: { updated_at: 'desc' },
    });
    return data.map(c => Conversation.fromDatabase(c));
  }

  async create(conversation: Conversation): Promise<Conversation> {
    const data = await this.prisma.conversation.create({
      data: {
        title: conversation.title,
        status: conversation.status,
        created_by: conversation.createdBy,
        participants: {
          create: conversation.participantIds.map(user_id => ({ user_id })),
        },
      },
      include: { participants: true },
    });
    return Conversation.fromDatabase(data);
  }

  async update(conversation: Conversation): Promise<Conversation> {
    const data = await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        title: conversation.title,
        status: conversation.status,
        updated_at: new Date(),
      },
      include: { participants: true },
    });
    return Conversation.fromDatabase(data);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.conversation.delete({ where: { id } });
  }

  async updateLastReadAt(conversationId: number, userId: number, timestamp: Date): Promise<void> {
    await this.prisma.conversationParticipant.update({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: userId,
        },
      },
      data: {
        last_read_at: timestamp,
      },
    });
  }
}
