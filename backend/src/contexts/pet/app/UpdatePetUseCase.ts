import { IPetRepository } from "../domain/repositories/IPetRepository.js";
import { Pet } from "../domain/entities/Pet.js";
import { EditPetRequest } from "../../../types/pet.js";

export class UpdatePetUseCase {
  private petRepository: IPetRepository;

  constructor(petRepository: IPetRepository) {
    this.petRepository = petRepository;
  }

  async execute(id: number, editPetBody: EditPetRequest): Promise<Pet> {

    const pet = await this.petRepository.update(id, editPetBody);

    return pet;
  }
}
