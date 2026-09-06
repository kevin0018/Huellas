import { Response } from "express";
import { FindPetCheckupsUseCase } from "../../app/FindPetCheckupsUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { CheckupAccessService } from "../../app/CheckupAccessService.js";

export class GetPetCheckupsController {
  private findPetCheckupsUseCase: FindPetCheckupsUseCase;
  private accessService: CheckupAccessService;

  constructor(findPetCheckupsUseCase: FindPetCheckupsUseCase, accessService: CheckupAccessService) {
    this.findPetCheckupsUseCase = findPetCheckupsUseCase;
    this.accessService = accessService;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = parseInt(req.params.id);
      await this.accessService.requireOwnedPet(petId, req.user.userId);
      const checkups = await this.findPetCheckupsUseCase.execute(petId);

      return res.status(200).send(checkups);
    } catch (error) {
      const message = (error as Error).message;
      return res.status(message === 'Resource not found' ? 404 : 400).send({ error: message });
    }
  }
}
