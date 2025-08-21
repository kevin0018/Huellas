import { PrismaClient } from '@prisma/client';
import { OwnerRepository } from '../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class PrismaOwnerRepository implements OwnerRepository {
  async findById(id: OwnerId): Promise<Owner | null> {
    const ownerRecord = await prisma.owner.findUnique({
      where: { id: id.getValue() },
      include: {
        user: true,
        pets: true
      }
    });

    if (!ownerRecord || !ownerRecord.user) return null;

    return Owner.createWithHashedPassword(
      new OwnerId(ownerRecord.id),
      ownerRecord.user.name,
      ownerRecord.user.last_name,
      ownerRecord.user.email,
      ownerRecord.user.password,
      ownerRecord.pets.map(pet => pet.id)
    );
  }

  async save(owner: Owner): Promise<number> {
    // Check if email is unique
    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email }
    });

    if (existingUser) {
      throw new Error('Owner with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(owner.password, 12);

    const result = await prisma.$transaction(async (prisma) => {
      // Create user first to get the auto-generated ID
      const createdUser = await prisma.user.create({
        data: {
          name: owner.name,
          last_name: owner.lastName,
          email: owner.email,
          password: hashedPassword,
          type: 'owner'
        }
      });

      // Create owner with the same ID
      await prisma.owner.create({
        data: {
          id: createdUser.id
        }
      });

      return createdUser.id;
    });

    return result;
  }

  async delete(id: OwnerId): Promise<void> {
    await prisma.user.delete({
      where: { id: id.getValue() }
    });
  }
}
