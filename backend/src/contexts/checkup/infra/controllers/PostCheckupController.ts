import { Response } from "express";
import { CreateCheckupUseCase } from "../../app/CreateCheckupUseCase.js";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { IProcedureRepository } from "../../../procedure/domain/repositories/IProcedureRepository.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { CheckupAccessService } from "../../app/CheckupAccessService.js";

export class PostCheckupController {
  private createCheckupUseCase: CreateCheckupUseCase;
  private procedureRepository: IProcedureRepository;
  private accessService: CheckupAccessService;

  constructor(
    checkupRepository: ICheckupRepository,
    petRepository: IPetRepository,
    procedureRepository: IProcedureRepository
  ){
    this.createCheckupUseCase = new CreateCheckupUseCase(checkupRepository);
    this.procedureRepository = procedureRepository;
    this.accessService = new CheckupAccessService(checkupRepository, petRepository);
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const { procedureId, date, notes } = req.body;
      const petId = parseInt(req.params.id);
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).send({ error: "Invalid date" });
      }
      const isoDate = parsedDate.toISOString();

      // Check procedure exist
      const procedure = await this.procedureRepository.findById(procedureId);

      if(!procedure){
        return res.status(404).send({ error: "Procedure not found"});
      }

      // Procedure and PetType is equal
      const pet = await this.accessService.requireOwnedPet(petId, req.user.userId);

      if(procedure.getPetType() !== pet?.getType()){
         return res.status(400).send({ error: "This procedure is not valid for this pet"});
      }

      const checkup = await this.createCheckupUseCase.execute({
        petId,
        procedureId,
        date: isoDate,
        notes
      });

      return res.status(201).send(checkup);
    } catch (error) {
      const message = (error as Error).message;
      return res.status(message === 'Resource not found' ? 404 : 400).send({ error: message });
    }
  }
}
