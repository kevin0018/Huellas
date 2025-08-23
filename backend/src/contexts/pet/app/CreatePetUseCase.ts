import { IPetRepository } from "../domain/repositories/IPetRepository.js";
import { PetSize, PetType, Sex } from "@prisma/client";
import { Pet } from "../domain/entities/Pet.js";

export type CreatePetRequest = {
  name: string;
  race: string;
  type: PetType;
  ownerId: number;
  birthDate: Date;
  size: PetSize;
  microchipCode: string;
  sex: Sex;
  hasPassport: boolean;
  countryOfOrigin: string | null;
  passportNumber: string | null;
  notes: string | null;
};

export class CreatePetUseCase {
  private petRepository: IPetRepository;

  constructor(petRepository: IPetRepository) {
    this.petRepository = petRepository;
  }

  async execute(createPetBody: CreatePetRequest): Promise<Pet> {
    const pet = await this.petRepository.save(createPetBody);

    return pet;
  }
}
