import { Pet } from '../domain/Pet';
import type { PetRepository } from '../domain/PetRepository';

export class MemoryPetRepository implements PetRepository {
  private pets: Pet[] = [];
  private seq = 1;

  async create(pet: Pet): Promise<Pet> {
    const created = Pet.create({
      id: this.seq++,
      name: pet.name,
      race: pet.race,
      type: pet.type,
      ownerId: pet.ownerId,
      birthDate: pet.birthDate, // keep as Date | null
      size: pet.size,
      microchipCode: pet.microchipCode,
      sex: pet.sex,
      hasPassport: pet.hasPassport,
      countryOfOrigin: pet.countryOfOrigin,
      passportNumber: pet.passportNumber,
      notes: pet.notes,
    });
    this.pets.push(created.clone());
    return created.clone();
  }

  async findById(id: number): Promise<Pet | null> {
    const p = this.pets.find(x => x.id === id);
    return p ? p.clone() : null;
  }

  async findByMicrochip(code: string): Promise<Pet | null> {
    const p = this.pets.find(x => x.microchipCode === code);
    return p ? p.clone() : null;
  }

  async listAll(): Promise<Pet[]> {
    return this.pets.map(p => p.clone());
  }

  async listByOwner(ownerId: number): Promise<Pet[]> {
    return this.pets.filter(p => p.ownerId === ownerId).map(p => p.clone());
  }

  async update(id: number, pet: Pet): Promise<Pet> {
    const idx = this.pets.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Pet not found');

    const updated = Pet.create({
      id,
      name: pet.name,
      race: pet.race,
      type: pet.type,
      ownerId: pet.ownerId,
      birthDate: pet.birthDate,
      size: pet.size,
      microchipCode: pet.microchipCode,
      sex: pet.sex,
      hasPassport: pet.hasPassport,
      countryOfOrigin: pet.countryOfOrigin,
      passportNumber: pet.passportNumber,
      notes: pet.notes,
    });

    this.pets[idx] = updated.clone();
    return updated.clone();
  }

  async delete(id: number): Promise<void> {
    this.pets = this.pets.filter(p => p.id !== id);
  }

  // helper for tests/manual resets
  clear(): void {
    this.pets = [];
    this.seq = 1;
  }
}