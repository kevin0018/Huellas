import { OwnerRepository } from '../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

export class MemoryOwnerRepository implements OwnerRepository {
  private owners: Map<number, Owner> = new Map();
  private nextId: number = 1;

  async findById(id: OwnerId): Promise<Owner | null> {
    return this.owners.get(id.getValue()) ?? null;
  }

  async save(owner: Owner): Promise<number> {
    // Verify if email already exists
    for (const existingOwner of this.owners.values()) {
      if (existingOwner.email === owner.email) {
        throw new Error('Email already exists');
      }
    }
    
    // Generate new ID and save
    const generatedId = this.nextId++;
    this.owners.set(generatedId, owner);
    
    return generatedId;
  }

  async delete(id: OwnerId): Promise<void> {
    this.owners.delete(id.getValue());
  }
}