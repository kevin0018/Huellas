import { Response } from "express";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { IProcedureRepository } from "../../../procedure/domain/repositories/IProcedureRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { PetType } from "@prisma/client";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { CheckupAccessService } from "../../app/CheckupAccessService.js";
import { EditCheckupData } from "../../../../types/checkup.js";

export class PatchCheckupController {
  private checkupRepository: ICheckupRepository;
  private procedureRepository: IProcedureRepository;
  private accessService: CheckupAccessService;

  constructor(
    checkupRepository: ICheckupRepository,
    petRepository: IPetRepository,
    procedureRepository: IProcedureRepository
  ) {
    this.checkupRepository = checkupRepository;
    this.procedureRepository = procedureRepository;
    this.accessService = new CheckupAccessService(checkupRepository, petRepository);
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const { procedureId, date, notes } = req.body;

      // Check checkup exist
      const checkupId = parseInt(req.params.id);

      const { pet } = await this.accessService.requireOwnedCheckup(checkupId, req.user.userId);

      // Check procedure exist
      let procedure = null;

      if (procedureId !== undefined) {
        procedure = await this.procedureRepository.findById(procedureId);

        if (!procedure) {
          return res.status(404).send({ error: "Procedure not found" });
        }

        // Check Procedure and PetType is equal
        const procedurePetType = procedure?.getPetType();
        const petType = pet.getType() as PetType;

        if (procedurePetType !== petType) {
          return res.status(400).send({ error: "This procedure is not valid for this pet" });
        }
      }

      const editData: EditCheckupData = {};

      if (notes !== undefined) {
        editData.notes = notes;
      }

      if (date) {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).send({ error: "Invalid date" });
        }
        editData.date = parsedDate.toISOString();
      }

      if (procedureId !== undefined) {
        editData.procedureId = procedureId;
      }

      // Update
      const updatedCheckup = await this.checkupRepository.update(checkupId, editData);

      return res.status(200).send(updatedCheckup);
    } catch (error) {
      const message = (error as Error).message;
      return res.status(message === 'Resource not found' ? 404 : 400).send({ error: message });
    }
  }
}
