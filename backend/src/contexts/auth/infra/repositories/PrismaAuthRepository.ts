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
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return null;
    }

    return UserAuth.create(
      user.id,
      user.name,
      user.last_name,
      user.email,
      user.password,
      user.type as UserType
    );
  }

  async getUserWithDescription(id: number): Promise<{ user: UserAuth; description?: string } | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        volunteer: true
      }
    });

    if (!user) {
      return null;
    }

    const userAuth = UserAuth.create(
      user.id,
      user.name,
      user.last_name,
      user.email,
      user.password,
      user.type as UserType
    );

    return {
      user: userAuth,
      description: user.volunteer?.description
    };
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateProfile(userId: number, name: string, lastName: string, email: string, description?: string): Promise<UserAuth> {
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic user information
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name,
          last_name: lastName,
          email
        }
      });

      // If description is provided and user is a volunteer, update volunteer description
      if (description !== undefined && user.type === 'volunteer') {
        await tx.volunteer.upsert({
          where: { id: userId },
          update: { description },
          create: { id: userId, description }
        });
      }

      return user;
    });

    return UserAuth.create(
      updatedUser.id,
      updatedUser.name,
      updatedUser.last_name,
      updatedUser.email,
      updatedUser.password,
      updatedUser.type as UserType
    );
  }

  async updatePassword(userId: number, plainPassword: string): Promise<void> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  async createVolunteerProfile(userId: number, description: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update user type to volunteer
      await tx.user.update({
        where: { id: userId },
        data: { type: 'volunteer' }
      });

      // Create volunteer profile
      await tx.volunteer.create({
        data: {
          id: userId,
          description
        }
      });
    });
  }

  async deleteVolunteerProfile(userId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Delete volunteer profile
      await tx.volunteer.delete({
        where: { id: userId }
      });

      // Update user type back to owner
      await tx.user.update({
        where: { id: userId },
        data: { type: 'owner' }
      });
    });
  }

  async hasVolunteerProfile(userId: number): Promise<boolean> {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: userId }
    });
    return volunteer !== null;
  }
}
