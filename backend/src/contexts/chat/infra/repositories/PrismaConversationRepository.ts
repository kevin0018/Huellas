  // Para compatibilidad con el contrato ConversationRepository
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
    return data.map((c: any) => new Conversation(
      c.id,
      c.title ?? null,
      c.status,
      c.created_at,
      c.updated_at,
      c.created_by,
      c.participants.map((p: any) => p.user_id)
    ));
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
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
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
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
  }
import { PrismaClient } from '@prisma/client';
import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';
import { UserType } from '../../../../types/chat.js';

export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Conversation | null> {
    const data = await this.prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!data) return null;
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
  }

  async findByParticipants(volunteerId: number, ownerId: number): Promise<Conversation | null> {
    const data = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { user_id: volunteerId } } },
          { participants: { some: { user_id: ownerId } } },
        ],
      },
      include: { participants: true },
    });
    if (!data) return null;
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
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
    return data.map((c: any) => new Conversation(
      c.id,
      c.title ?? null,
      c.status,
      c.created_at,
      c.updated_at,
      c.created_by,
      c.participants.map((p: any) => p.user_id)
    ));
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
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
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
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
  }


  async findByUserId(userId: number, userType: UserType): Promise<Conversation[]> {
  const data = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { user_id: userId },
        },
      },
      include: { participants: true },
      orderBy: { updated_at: 'desc' },
    });
    return data.map((c: any) => new Conversation(
      c.id,
      c.title ?? null,
      c.status,
      c.created_at,
      c.updated_at,
      c.created_by,
      c.participants.map((p: any) => p.user_id)
    ));
  }


  async save(conversation: Conversation): Promise<Conversation> {
  const data = await this.prisma.conversation.upsert({
      where: { id: conversation.id },
      update: {
        title: conversation.title,
        status: conversation.status,
        updated_at: new Date(),
      },
      create: {
        title: conversation.title,
        status: conversation.status,
        created_by: conversation.createdBy,
        participants: {
          create: conversation.participantIds.map(user_id => ({ user_id })),
        },
      },
      include: { participants: true },
    });
    return new Conversation(
      data.id,
      data.title ?? null,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants.map((p: any) => p.user_id)
    );
  }


  async delete(id: number): Promise<void> {
  await this.prisma.conversation.delete({ where: { id } });
  }
}
