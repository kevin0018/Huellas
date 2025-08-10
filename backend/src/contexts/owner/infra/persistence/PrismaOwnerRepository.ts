import { PrismaClient } from '@prisma/client';
import { OwnerRepository } from '../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

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

    return new Owner(
      new OwnerId(ownerRecord.id),
      ownerRecord.user.name,
      ownerRecord.user.last_name,
      ownerRecord.user.email,
      ownerRecord.pets.map(pet => pet.id)
    );
  }

  async save(owner: Owner): Promise<void> {
    // Verify if the id already exists
    const existingOwner = await this.findById(owner.id);
    if (existingOwner) {
      throw new Error('Owner id already exists');
    }
    // Verify if the email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: owner.email }
    });
    if (existingEmail) {
      throw new Error('Email already exists');
    }
    // If it doesn't exist, create the User and the Owner
    await prisma.user.create({
      data: {
        id: owner.id.getValue(),
        name: owner.name,
        last_name: owner.lastName,
        email: owner.email,
        type: 'owner',
        owner: {
          create: {}
        }
      }
    });
  }
}
