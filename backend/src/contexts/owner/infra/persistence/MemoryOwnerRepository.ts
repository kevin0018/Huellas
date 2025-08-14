import { OwnerRepository } from '../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

export class MemoryOwnerRepository implements OwnerRepository {
  private owners: Map<number, Owner> = new Map();

  async findById(id: OwnerId): Promise<Owner | null> {
    return this.owners.get(id.getValue()) ?? null;
  }

  async save(owner: Owner): Promise<void> {
    // Verify if Owner id already exists
    const existingOwner = await this.findById(owner.id);
    if (existingOwner) {
      throw new Error('Owner id already exists');
    }
    // Verify if email already exists
    for (const existingOwner of this.owners.values()) {
      if (existingOwner.email === owner.email) {
        throw new Error('Email already exists');
      }
    }
    this.owners.set(owner.id.getValue(), owner);
  }

  async delete(id: OwnerId): Promise<void> {
    this.owners.delete(id.getValue());
  }
}