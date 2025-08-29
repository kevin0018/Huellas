import { PrismaClient } from '@prisma/client';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';
import { MessageType } from '../../../../types/chat.js';

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Message | null> {
  const data = await this.prisma.message.findUnique({ where: { id } });
    if (!data) return null;
    return new Message(
      data.id,
      data.conversation_id,
      data.sender_id,
      data.content,
      data.type as MessageType,
      data.created_at,
      data.updated_at,
      data.edited_at
    );
  }

  async findByConversation(conversationId: number): Promise<Message[]> {
  const data = await this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
    });
    return data.map((m: any) => new Message(
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.type as MessageType,
      m.created_at,
      m.updated_at,
      m.edited_at
    ));
  }

  async create(message: Message): Promise<Message> {
  const data = await this.prisma.message.create({
      data: {
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        content: message.content,
        type: message.type,
      },
    });
    return new Message(
      data.id,
      data.conversation_id,
      data.sender_id,
      data.content,
      data.type as MessageType,
      data.created_at,
      data.updated_at,
      data.edited_at
    );
  }

  async update(message: Message): Promise<Message> {
  const data = await this.prisma.message.update({
      where: { id: message.id },
      data: {
        content: message.content,
        type: message.type,
        edited_at: new Date(),
      },
    });
    return new Message(
      data.id,
      data.conversation_id,
      data.sender_id,
      data.content,
      data.type as MessageType,
      data.created_at,
      data.updated_at,
      data.edited_at
    );
  }

  async delete(id: number): Promise<void> {
  await this.prisma.message.delete({ where: { id } });
  }
}
