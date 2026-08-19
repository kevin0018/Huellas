import { Request, Response } from "express";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { UpdatePetUseCase } from "../../app/UpdatePetUseCase.js";
import { PetSize, PetType, Sex, Prisma } from "@prisma/client";

export class PatchPetController {
  private updatePetUseCase: UpdatePetUseCase;

  constructor(petRepository: IPetRepository) {
    this.updatePetUseCase = new UpdatePetUseCase(petRepository);
  }

  async handle(req: Request, res: Response) {
    try {
      const { name, race, type, size, microchipCode, sex, hasPassport, countryOfOrigin, passportNumber, notes } = req.body;
      const birthDate = req.body.birthDate ? new Date(req.body.birthDate) : undefined;

      const id = parseInt(req.params.id);
      const currentDate = new Date;

      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return res.status(400).send({ error: "Pet name cannot be empty" });
      }
      if (birthDate && birthDate > currentDate) {
        return res.status(400).send({ error: "The date of birth cannot be later than the current date " });
      }
      if ((type !== undefined && !Object.values(PetType).includes(type)) ||
          (size !== undefined && !Object.values(PetSize).includes(size)) ||
          (sex !== undefined && !Object.values(Sex).includes(sex))) {
        return res.status(400).send({ error: "Invalid pet data" });
      }

      const pet = await this.updatePetUseCase.execute(id, {
        name: typeof name === 'string' ? name.trim() : undefined,
        race: race === undefined ? undefined : (typeof race === 'string' && race.trim() ? race.trim() : null),
        type,
        birthDate,
        size,
        microchipCode: microchipCode === undefined ? undefined : (typeof microchipCode === 'string' && microchipCode.trim() ? microchipCode.trim() : null),
        sex,
        hasPassport,
        countryOfOrigin,
        passportNumber,
        notes
      });

      return res.status(200).send(pet);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).send({ error: 'Microchip code already exists' });
      }
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
