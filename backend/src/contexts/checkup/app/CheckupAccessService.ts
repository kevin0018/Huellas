import type { IPetRepository } from '../../pet/domain/repositories/IPetRepository.js';
import type { Pet } from '../../pet/domain/entities/Pet.js';
import type { ICheckupRepository } from '../domain/repositories/ICheckupRepository.js';
import type { Checkup } from '../domain/entities/Checkup.js';

export class CheckupAccessService {
  constructor(
    private readonly checkupRepository: ICheckupRepository,
    private readonly petRepository: IPetRepository
  ) {}

  async requireOwnedPet(petId: number, ownerId: number): Promise<Pet> {
    const pet = await this.petRepository.findById(petId);
    if (!pet || pet.getOwnerId() !== ownerId) {
      throw new Error('Resource not found');
    }
    return pet;
  }

  async requireOwnedCheckup(checkupId: number, ownerId: number): Promise<{ checkup: Checkup; pet: Pet }> {
    const checkup = await this.checkupRepository.findById(checkupId);
    if (!checkup) {
      throw new Error('Resource not found');
    }
    const pet = await this.requireOwnedPet(checkup.getPetId(), ownerId);
    return { checkup, pet };
  }
}
