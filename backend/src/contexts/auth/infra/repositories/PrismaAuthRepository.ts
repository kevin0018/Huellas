import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/AuthRepository.js';
import { UserAuth, UserType } from '../../domain/entities/UserAuth.js';

const prisma = new PrismaClient();

export class PrismaAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<UserAuth | null> {
    const userRecord = await prisma.user.findUnique({
      where: { email }
    });

    if (!userRecord) return null;

    return UserAuth.create(
      userRecord.id,
      userRecord.name,
      userRecord.last_name,
      userRecord.email,
      userRecord.password,
      userRecord.type as UserType
    );
  }

  async findById(id: number): Promise<UserAuth | null> {
    const userRecord = await prisma.user.findUnique({
      where: { id }
    });

    if (!userRecord) return null;

    return UserAuth.create(
      userRecord.id,
      userRecord.name,
      userRecord.last_name,
      userRecord.email,
      userRecord.password,
      userRecord.type as UserType
    );
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
