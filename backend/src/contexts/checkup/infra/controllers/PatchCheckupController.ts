import { Request, Response } from "express";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { IProcedureRepository } from "../../../procedure/domain/repositories/IProcedureRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { PetType } from "@prisma/client";

export class PatchCheckupController {
  private checkupRepository: ICheckupRepository;
  private petRepository: IPetRepository;
  private procedureRepository: IProcedureRepository;

  constructor(
    checkupRepository: ICheckupRepository,
    petRepository: IPetRepository,
    procedureRepository: IProcedureRepository
  ) {
    this.checkupRepository = checkupRepository;
    this.petRepository = petRepository;
    this.procedureRepository = procedureRepository;
  }

  async handle(req: Request, res: Response) {
    try {
      const { procedureId, date, notes } = req.body;

      // Check checkup exist
      const checkupId = parseInt(req.params.id);

      const checkup = await this.checkupRepository.findById(checkupId);

      if (!checkup) {
        return res.status(404).send({ error: "Checkup not found" });
      }

      // Check procedure exist
      let procedure = null;

      if (procedureId) {
        procedure = await this.procedureRepository.findById(procedureId);

        if (!procedure) {
          return res.status(404).send({ error: "Procedure not found" });
        }

        // Check Procedure and PetType is equal
        const procedurePetType = procedure?.getPetType();
        const petId = checkup?.getPetId() as number;
        const pet = await this.petRepository.findById(petId);
        const petType = pet?.getType() as PetType;

        if (procedurePetType !== petType) {
          return res.status(400).send({ error: "This procedure is not valid for this pet" });
        }
      }

      const editData = {} as any;

      if (notes) {
        editData.notes = notes;
      }

      if (date) {
        editData.date = new Date(date).toISOString();
      }

      if (procedureId) {
        editData.procedureId = procedureId;
      }

      // Update
      const updatedCheckup = await this.checkupRepository.update(checkupId, editData);

      return res.status(201).send(updatedCheckup);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
