import { Request, Response } from "express";
import { CreateCheckupUseCase } from "../../app/CreateCheckupUseCase.js";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { IProcedureRepository } from "../../../procedure/domain/repositories/IProcedureRepository.js";

export class PostCheckupController {
  private createCheckupUseCase: CreateCheckupUseCase;
  private petRepository: IPetRepository;
  private procedureRepository: IProcedureRepository;

  constructor(
    checkupRepository: ICheckupRepository,
    petRepository: IPetRepository,
    procedureRepository: IProcedureRepository
  ){
    this.createCheckupUseCase = new CreateCheckupUseCase(checkupRepository);
    this.petRepository = petRepository;
    this.procedureRepository = procedureRepository;
  }

  async handle(req: Request, res: Response) {
    try {
      const { procedureId, date, notes } = req.body;
      const petId = parseInt(req.params.id);
      const isoDate = new Date(date).toISOString();

      // Check procedure exist
      const procedure = await this.procedureRepository.findById(procedureId);

      if(!procedure){
        return res.status(404).send({ error: "Procedure not found"});
      }

      // Procedure and PetType is equal
      const pet = await this.petRepository.findById(petId);

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
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
