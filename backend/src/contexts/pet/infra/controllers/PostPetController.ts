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
      const { id, name, race, type, ownerId, birthDate, size, microchipCode, sex, hasPassport, countryOfOrigin, passportNumber, notes } = req.body;

      await this.createPetUseCase.execute({
        id: parseInt(id),
        name,
        race,
        type,
        ownerId: parseInt(ownerId),
        birthDate, 
        size,
        microchipCode,
        sex, 
        hasPassport,
        countryOfOrigin,
        passportNumber,
        notes
      });

      return res.status(201).send({ message: "Pet creado correctamente ✅" });
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
