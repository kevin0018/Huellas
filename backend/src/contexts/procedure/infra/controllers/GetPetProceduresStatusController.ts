import { Response } from "express";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import type { GetPetProceduresStatusUseCase } from '../../app/GetPetProceduresStatusUseCase.js';

export class GetPetProceduresStatusController {
  constructor(private readonly getPetProceduresStatus: GetPetProceduresStatusUseCase) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = parseInt(req.params.id);
      return res.status(200).send(await this.getPetProceduresStatus.execute(petId));
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
