import type { PetRepository } from '../../domain/PetRepository';
import { ListPetsQuery } from './ListPetsQuery';

export class ListPetsQueryHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(_query: ListPetsQuery) {
    return await this.repo.listAll();
  }
}
