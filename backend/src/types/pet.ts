import { PetType, PetSize, Sex } from "@prisma/client";

export type CreatePetRequest = {
  name: string;
  race: string;
  type: PetType;
  ownerId: number;
  birthDate: string;
  size: PetSize;
  microchipCode: string;
  sex: Sex;
  hasPassport: boolean;
  countryOfOrigin: string | null;
  passportNumber: string | null;
  notes: string | null;
};

export type EditPetRequest = {
  name?: string;
  race?: string;
  birthDate?: string;
  size?: PetSize;
  sex?: Sex;
  hasPassport?: boolean;
  countryOfOrigin?: string | null;
  passportNumber?: string | null;
  notes?: string | null;
};