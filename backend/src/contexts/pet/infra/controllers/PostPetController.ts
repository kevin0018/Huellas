import { Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { CreatePetUseCase } from "../../app/CreatePetUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

export class PostPetController {
  private createPetUseCase: CreatePetUseCase;

  constructor(petRepository: IPetRepository) {
    this.createPetUseCase = new CreatePetUseCase(petRepository);
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name, race, type, birthDate, size, microchipCode,
        sex, hasPassport, countryOfOrigin, passportNumber, notes,
        ownerId: ownerIdFromBody,        // <-- allow ownerId from body
      } = req.body as any;

      // fallback to JWT user if body didn't provide ownerId
      const ownerId =
        ownerIdFromBody ??
        (req.user as any)?.ownerId ??      // if your JWT ever carries ownerId
        (req.user as any)?.userId;         // last resort

      if (!ownerId) {
        return res.status(400).send({ error: "Missing ownerId." });
      }

      const pet = await this.createPetUseCase.execute({
        name,
        race,
        type,
        ownerId,
        birthDate, // already ISO string from frontend
        size,
        microchipCode,
        sex,
        hasPassport,
        countryOfOrigin,
        passportNumber,
        notes,
      });

      return res.status(201).send(pet);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}