import { Checkup } from "../domain/entities/Checkup.js";
import { ICheckupRepository } from "../domain/repositories/ICheckupRepository.js";

export class FindPetCheckupsUseCase {
  private checkupRepository: ICheckupRepository;

  constructor(checkupRepository: ICheckupRepository) {
    this.checkupRepository = checkupRepository;
  }

  async execute(petId: number): Promise<Checkup[]> {
    const checkups = await this.checkupRepository.findByPetId(petId);

    return checkups;
  }
}
