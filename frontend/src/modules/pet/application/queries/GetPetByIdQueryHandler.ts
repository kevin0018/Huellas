import type { PetRepository } from '../../domain/PetRepository';
import { GetPetByIdQuery } from './GetPetByIdQuery';

export class GetPetByIdQueryHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(query: GetPetByIdQuery) {
    return await this.repo.findById(query.id);
  }
}
