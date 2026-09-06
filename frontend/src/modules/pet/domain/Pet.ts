export const PetType = {
  DOG: 'dog' as const,
  CAT: 'cat' as const,
  FERRET: 'ferret' as const
};

export type PetType = typeof PetType[keyof typeof PetType];

export const PetSize = {
  SMALL: 'small' as const,
  MEDIUM: 'medium' as const,
  LARGE: 'large' as const
};

export type PetSize = typeof PetSize[keyof typeof PetSize];

export const Sex = {
  MALE: 'male' as const,
  FEMALE: 'female' as const
};

export type Sex = typeof Sex[keyof typeof Sex];

export interface Pet {
  id: number;
  name: string;
  race?: string | null;
  type: PetType;
  ownerId: number;
  birthDate: string; // ISO date string
  size: PetSize;
  microchipCode?: string | null;
  sex: Sex;
  hasPassport: boolean;
  countryOfOrigin?: string | null;
  passportNumber?: string | null;
  notes?: string | null;
  allergies?: string | null;
  activeMedications?: string | null;
  medicalConditions?: string | null;
  profileImageUrl?: string | null;
}

export const clone = (pet: Pet): Pet => {
  return {
    id: pet.id,
    name: pet.name,
    race: pet.race,
    type: pet.type,
    ownerId: pet.ownerId,
    birthDate: pet.birthDate,
    size: pet.size,
    microchipCode: pet.microchipCode,
    sex: pet.sex,
    hasPassport: pet.hasPassport,
    countryOfOrigin: pet.countryOfOrigin,
    passportNumber: pet.passportNumber,
    notes: pet.notes,
    allergies: pet.allergies,
    activeMedications: pet.activeMedications,
    medicalConditions: pet.medicalConditions,
    profileImageUrl: pet.profileImageUrl
  };
};
