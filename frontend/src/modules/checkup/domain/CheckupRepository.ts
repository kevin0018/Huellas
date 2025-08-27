import { Checkup } from './Checkup';

export interface CheckupRepository {
  listByPet(petId: number): Promise<Checkup[]>;
  findLatestByPetAndProcedure(petId: number, procedureId: number): Promise<Checkup | null>;
  create(ch: Checkup): Promise<Checkup>;
  delete(id: number): Promise<void>;
}