import { Checkup } from './Checkup';

export interface CheckupRepository {
  listByPet(petId: number): Promise<Checkup[]>;
  findLatestByPetAndProcedure(petId: number, procedureId: number): Promise<Checkup | null>;
  create(petId: number, checkupData: { procedureId: number, date: string, notes: string }): Promise<Checkup>;
  delete(id: number): Promise<void>;
  update(checkupId: number, checkupData: { petId: number, date: string, notes: string }): Promise<Checkup>
}