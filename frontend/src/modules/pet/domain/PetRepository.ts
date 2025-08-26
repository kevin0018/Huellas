import type { Pet } from './Pet';

export interface PetRepository {
  getUserPets(): Promise<Pet[]>;
  create(data: Omit<Pet, 'id' | 'ownerId'>): Promise<Pet>;
}
