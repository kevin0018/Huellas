import { IPetRepository } from "../domain/repositories/IPetRepository.js";
import { Pet } from "../domain/entities/Pet.js";

export class FindPetsByOwnerUseCase {
  private petRepository: IPetRepository;

  constructor(petRepository: IPetRepository) {
    this.petRepository = petRepository;
  }

  async execute(ownerId: number): Promise<Pet[]> {
    const pets = await this.petRepository.findByOwnerId(ownerId);

    return pets;
  }
}
