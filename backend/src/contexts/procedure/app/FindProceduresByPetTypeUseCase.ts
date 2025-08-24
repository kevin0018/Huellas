import { PetType } from "@prisma/client";
import { Procedure } from "../domain/entities/Procedure.js";
import { IProcedureRepository } from "../domain/repositories/IProcedureRepository.js";

export class FindProceduresByPetTypeUseCase {
  private procedureRepository: IProcedureRepository;

  constructor(procedureRepository: IProcedureRepository) {
    this.procedureRepository = procedureRepository;
  }

  async execute(type: PetType): Promise<Procedure[]> {
    const procedures = await this.procedureRepository.findByPetType(type);

    return procedures;
  }
}