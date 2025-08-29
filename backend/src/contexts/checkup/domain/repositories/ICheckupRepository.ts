import { CreateCheckupData, EditCheckupData } from "../../../../types/checkup.js";
import { Checkup } from "../entities/Checkup.js";

export interface ICheckupRepository {
  findById(id: number): Promise<Checkup | null>;
  findByPetId(petId: number): Promise<Checkup[]>;
  update(id: number, data: EditCheckupData): Promise<Checkup>;
  delete(id: number): Promise<void>;
  save(data: CreateCheckupData): Promise<Checkup>;
  findByPetProcedure(petId: number, procedureId: number): Promise<Checkup | null>;
}
