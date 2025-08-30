import { PetType } from "@prisma/client";

export enum PetProcedureStatus {
  DONE = 'DONE',
  MISSING = 'MISSING',
  UPCOMING = 'UPCOMING'
}

export type PetProcedureData = {
  id: number;
  petType: PetType;
  name: string;
  age: number;
  notes: string | null;
  status: PetProcedureStatus;
}