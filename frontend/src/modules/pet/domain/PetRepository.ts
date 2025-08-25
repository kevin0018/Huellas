import type { Pet } from './Pet.js';

export interface PetRepository {
  getUserPets(): Promise<Pet[]>;
}
