import { Owner } from '../domain/Owner';
import type { OwnerRepository } from '../domain/OwnerRepository';

export class MemoryOwnerRepository implements OwnerRepository {
  private owners: Owner[] = [];

  async register(owner: Owner): Promise<void> {
    this.owners.push(owner.clone());
  }

  getAll(): Owner[] {
    return this.owners.map(o => o.clone());
  }

  clear(): void {
    this.owners = [];
  }
}
