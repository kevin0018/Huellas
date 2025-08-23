import { Request, Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { CreatePetUseCase } from "../../app/CreatePetUseCase.js";

export class PostPetController {
  private createPetUseCase: CreatePetUseCase;

  constructor(petRepository: IPetRepository) {
    this.createPetUseCase = new CreatePetUseCase(petRepository);
  }

  async handle(req: Request, res: Response) {
    try {
      const { name, race, type, birthDate, size, microchipCode, sex, hasPassport, countryOfOrigin, passportNumber, notes } = req.body;

      const pet = await this.createPetUseCase.execute({
        name,
        race,
        type,
        ownerId: req.user.userId as number,
        birthDate, 
        size,
        microchipCode,
        sex, 
        hasPassport,
        countryOfOrigin,
        passportNumber,
        notes
      });

      return res.status(201).send(pet);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
