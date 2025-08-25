import type { PetRepository } from '../domain/PetRepository.js';
import type { Pet } from '../domain/Pet.js';
import type { GetUserPetsQuery } from './GetUserPetsQuery.js';

export class GetUserPetsQueryHandler {
  private repository: PetRepository;

  constructor(repository: PetRepository) {
    this.repository = repository;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_query: GetUserPetsQuery): Promise<Pet[]> {
    return this.repository.getUserPets();
  }
}
