// frontend/src/modules/pet/domain/PetRepository.ts
import type { Pet } from './Pet';

export interface PetRepository {
  getUserPets(): Promise<Pet[]>;
}
