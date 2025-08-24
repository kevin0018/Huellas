import { CreateCheckupData } from "../../../types/checkup.js";
import { Checkup } from "../domain/entities/Checkup.js";
import { ICheckupRepository } from "../domain/repositories/ICheckupRepository.js";

export class CreateCheckupUseCase {
  private checkupRepository: ICheckupRepository;

  constructor(
    checkupRepository: ICheckupRepository,
  ){
    this.checkupRepository = checkupRepository;
  }

  async execute(data: CreateCheckupData): Promise<Checkup> {
    const checkup = await this.checkupRepository.save(data);
    return checkup;
  }
}
