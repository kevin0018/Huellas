import { Pet } from '../../domain/Pet';
import type { PetRepository } from '../../domain/PetRepository';
import { RegisterPetCommand } from './RegisterPetCommand';

export class RegisterPetCommandHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(command: RegisterPetCommand) {
    const birthDate =
      command.birthDate == null ? null : new Date(command.birthDate as any);

    const pet = Pet.create({
      name: command.name,
      race: command.race ?? null,
      type: command.type,
      ownerId: command.ownerId,
      birthDate, // now Date | null
      size: command.size ?? null,
      microchipCode: command.microchipCode ?? null,
      sex: command.sex,
      hasPassport: !!command.hasPassport,
      countryOfOrigin: command.countryOfOrigin ?? null,
      passportNumber: command.passportNumber ?? null,
      notes: command.notes ?? null,
    });

    return await this.repo.create(pet);
  }
}
