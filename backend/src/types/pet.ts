import { PetType, PetSize, Sex } from "@prisma/client";

export type CreatePetRequest = {
  name: string;
  race?: string | null;
  type: PetType;
  ownerId: number;
  birthDate: string;
  size: PetSize;
  microchipCode?: string | null;
  sex: Sex;
  hasPassport: boolean;
  countryOfOrigin: string | null;
  passportNumber: string | null;
  notes: string | null;
};

export type EditPetRequest = {
  name?: string;
  race?: string | null;
  type?: PetType;
  birthDate?: Date;
  size?: PetSize;
  microchipCode?: string | null;
  sex?: Sex;
  hasPassport?: boolean;
  countryOfOrigin?: string | null;
  passportNumber?: string | null;
  notes?: string | null;
};
