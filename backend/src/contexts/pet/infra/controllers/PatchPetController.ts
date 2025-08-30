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
      const { name, race, size, sex, hasPassport, countryOfOrigin, passportNumber, notes } = req.body;
      const birthDate = req.body.birthDate ? new Date(req.body.birthDate) : undefined;

      const id = parseInt(req.params.id);
      const currentDate = new Date;

      if (birthDate && birthDate > currentDate) {
        return res.status(400).send({ error: "The date of birth cannot be later than the current date " });
      }

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

      return res.status(200).send(pet);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
