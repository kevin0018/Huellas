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
        ownerId: ownerIdFromBody,
      } = req.body as any;

      const currentDate = new Date();

      if (birthDate && new Date(birthDate) > currentDate) {
        return res.status(400).send({ error: "The date of birth cannot be later than the current date." });
      }

      const isoDate = new Date(birthDate).toISOString();

      const ownerId =
        ownerIdFromBody ??
        (req.user as any)?.ownerId ??
        (req.user as any)?.userId;

      if (!ownerId) {
        return res.status(400).send({ error: "Missing ownerId." });
      }

      const pet = await this.createPetUseCase.execute({
        name,
        race,
        type,
        ownerId,
        birthDate: isoDate,
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