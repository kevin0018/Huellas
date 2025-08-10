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
    
  }
}