// modules/pet/domain/PetRepository.ts
import { Pet } from './Pet';

export interface PetRepository {
  create(pet: Pet): Promise<Pet>;                     // POST /pets
  findById(id: number): Promise<Pet | null>;          // GET /pets/:id
  findByMicrochip(code: string): Promise<Pet | null>; // GET /pets/by-microchip/:code
  listAll(): Promise<Pet[]>;                          // GET /pets
  listByOwner(ownerId: number): Promise<Pet[]>;       // GET /pets?ownerId=...
  update(id: number, pet: Pet): Promise<Pet>;         // PUT /pets/:id
  delete(id: number): Promise<void>;                  // DELETE /pets/:id
}