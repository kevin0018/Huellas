import { Request, Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { FindPetsByOwnerUseCase } from "../../app/FindPetsByOwnerUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

export class GetMyPetsController {
  private findPetsByOwnerUseCase: FindPetsByOwnerUseCase;

  constructor(petRepository: IPetRepository) {
    this.findPetsByOwnerUseCase = new FindPetsByOwnerUseCase(petRepository);
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const ownerId = req.user.userId;
      const pets = await this.findPetsByOwnerUseCase.execute(ownerId);

      return res.status(201).send(pets);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
