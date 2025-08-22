import { IPetRepository } from "../domain/repositories/IPetRepository.js";
import { PetSize, PetType, Sex } from "@prisma/client";
import { Pet } from "../domain/entities/Pet.js";

type CreatePetRequest = {
    id: number;
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
  constructor(private petRepository: IPetRepository) {}

  async execute(request: CreatePetRequest): Promise<void> {
    const pet = new Pet(
      request.id,
      request.name,
      request.race,
      request.type,
      request.ownerId,
      request.birthDate,
      request.size,
      request.microchipCode,
      request.sex,
      request.hasPassport,
      request.countryOfOrigin,
      request.passportNumber,
      request.notes
    );

    await this.petRepository.save(pet);
  }
}
