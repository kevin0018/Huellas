import { Request, Response } from "express";
import { FindPetCheckupsUseCase } from "../../app/FindPetCheckupsUseCase.js";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

export class GetPetCheckupsController {
  private findPetCheckupsUseCase: FindPetCheckupsUseCase;

  constructor(checkupRepository: ICheckupRepository) {
    this.findPetCheckupsUseCase = new FindPetCheckupsUseCase(checkupRepository)
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = parseInt(req.params.id);
      const checkups = await this.findPetCheckupsUseCase.execute(petId);

      return res.status(200).send(checkups);
    } catch (error) {
      return res.status(500).send({ error: (error as Error).message });
    }
  }
}
