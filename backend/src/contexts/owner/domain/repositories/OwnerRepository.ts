import { Owner } from '../entities/Owner.js';
import { OwnerId } from '../value-objects/OwnerId.js';

export interface OwnerRepository {
  findById(id: OwnerId): Promise<Owner | null>;
  save(owner: Owner): Promise<number>;
  delete(id: OwnerId): Promise<void>;
}