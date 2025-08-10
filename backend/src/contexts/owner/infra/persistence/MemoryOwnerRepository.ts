import { OwnerRepository } from '../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

export class MemoryOwnerRepository implements OwnerRepository {
  private owners: Map<number, Owner> = new Map();

  async findById(id: OwnerId): Promise<Owner | null> {
    return this.owners.get(id.getValue()) ?? null;
  }

  async save(owner: Owner): Promise<void> {
    this.owners.set(owner.id.getValue(), owner);
  }
}