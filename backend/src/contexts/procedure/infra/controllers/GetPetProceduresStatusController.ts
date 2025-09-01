import { Response } from "express";
import { IProcedureRepository } from "../../domain/repositories/IProcedureRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { Pet } from "../../../pet/domain/entities/Pet.js";
import { ICheckupRepository } from "../../../checkup/domain/repositories/ICheckupRepository.js";
import { PetProcedureStatus } from "../../../../types/procedure.js";

export class GetPetProceduresStatusController {
  private procedureRepository: IProcedureRepository;
  private petRepository: IPetRepository;
  private checkupRepository: ICheckupRepository;

  constructor(
    procedureRepository: IProcedureRepository,
    petRepository: IPetRepository,
    checkupRepository: ICheckupRepository) {

    this.procedureRepository = procedureRepository;
    this.petRepository = petRepository;
    this.checkupRepository = checkupRepository;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = parseInt(req.params.id);
      const pet = await this.petRepository.findById(petId) as Pet;

      const petType = pet.getType();
      const petBirthdate = pet.getBirthDate();

      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - petBirthdate.getTime();

      const petAgeInWeeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
      const petAgeInYears = timeDifference / (1000 * 60 * 60 * 24 * 365.25);

      const petProcedures = await this.procedureRepository.findByPetType(petType);

      const proceduresWithStatus = await Promise.all(petProcedures.map(async (procedure) => {
        const checkup = await this.checkupRepository.findByPetProcedure(petId, procedure.getId());

        let status: PetProcedureStatus;
        const procedureAge = procedure.getAge();

        if (checkup) {
          status = PetProcedureStatus.DONE;
        } else if (procedureAge <= petAgeInWeeks) {
          status = PetProcedureStatus.MISSING;
        } else {
          status = PetProcedureStatus.UPCOMING;
        }

        return { ...procedure, status, checkupId: checkup?.getId(), checkupDate: checkup?.getDate(), checkupNotes: checkup?.getNotes() };
      }));

      return res.status(201).send(proceduresWithStatus);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
