import { Response } from "express";
import { FindPetsByOwnerUseCase } from "../../app/FindPetsByOwnerUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

export class GetMyPetsController {
  private findPetsByOwnerUseCase: FindPetsByOwnerUseCase;

  constructor(findPetsByOwnerUseCase: FindPetsByOwnerUseCase) {
    this.findPetsByOwnerUseCase = findPetsByOwnerUseCase;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const ownerId = req.user.userId;
      const pets = await this.findPetsByOwnerUseCase.execute(ownerId);

      return res.status(200).send(pets);
    } catch (error) {
      return res.status(500).send({ error: (error as Error).message });
    }
  }
}
