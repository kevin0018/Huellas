import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { FindProceduresByPetTypeUseCase } from "../../app/FindProceduresByPetTypeUseCase.js";
import { IProcedureRepository } from "../../domain/repository/IProcedureRepository.js";
import { PetType } from "@prisma/client";

export class GetProceduresController {
  private findProceduresByPetTypeUseCase: FindProceduresByPetTypeUseCase;

  constructor(procedureRepository: IProcedureRepository) {
    this.findProceduresByPetTypeUseCase = new FindProceduresByPetTypeUseCase(procedureRepository);
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petType = req.params.type as PetType;

      if (!Object.values(PetType).includes(petType)) {
        return res.status(400).send({ error: "Invalid animal type" });
      }

      const procedures = await this.findProceduresByPetTypeUseCase.execute(petType);

      return res.status(201).send(procedures);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
