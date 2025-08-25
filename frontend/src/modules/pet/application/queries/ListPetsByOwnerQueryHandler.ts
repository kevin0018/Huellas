import type { PetRepository } from '../../domain/PetRepository';
import { ListPetsByOwnerQuery } from './ListPetsByOwnerQuery';

export class ListPetsByOwnerQueryHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(query: ListPetsByOwnerQuery) {
    return await this.repo.listByOwner(query.ownerId);
  }
}
