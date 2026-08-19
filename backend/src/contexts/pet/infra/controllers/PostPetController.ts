import { Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { CreatePetUseCase } from "../../app/CreatePetUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { PetSize, PetType, Sex, Prisma } from "@prisma/client";

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
      } = req.body;

      const currentDate = new Date();

      if (typeof name !== 'string' || !name.trim() || !Object.values(PetType).includes(type) ||
          !Object.values(PetSize).includes(size) || !Object.values(Sex).includes(sex) || !birthDate) {
        return res.status(400).send({ error: "Invalid pet data" });
      }

      if (birthDate && new Date(birthDate) > currentDate) {
        return res.status(400).send({ error: "The date of birth cannot be later than the current date." });
      }

      const isoDate = new Date(birthDate).toISOString();

      const ownerId = req.user.userId;

      const pet = await this.createPetUseCase.execute({
        name: name.trim(),
        race: typeof race === 'string' && race.trim() ? race.trim() : null,
        type,
        ownerId,
        birthDate: isoDate,
        size,
        microchipCode: typeof microchipCode === 'string' && microchipCode.trim() ? microchipCode.trim() : null,
        sex,
        hasPassport,
        countryOfOrigin,
        passportNumber,
        notes,
      });

      return res.status(201).send(pet);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).send({ error: 'Microchip code already exists' });
      }
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
