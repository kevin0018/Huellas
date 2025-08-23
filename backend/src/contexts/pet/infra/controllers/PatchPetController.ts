import { Request, Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { UpdatePetUseCase } from "../../app/UpdatePetUseCase.js";

export class PatchPetController {
  private updatePetUseCase: UpdatePetUseCase;

  constructor(petRepository: IPetRepository) {
    this.updatePetUseCase = new UpdatePetUseCase(petRepository);
  }

  async handle(req: Request, res: Response) {
    try {
      const { name, race, birthDate, size, sex, hasPassport, countryOfOrigin, passportNumber, notes } = req.body;
      const id = parseInt(req.params.id);

      const pet = await this.updatePetUseCase.execute(id, {
        name,
        race,
        birthDate,
        size,
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
