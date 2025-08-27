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
  race: string;
  type: PetType;
  ownerId: number;
  birthDate: string; // ISO date string
  size: PetSize;
  microchipCode: string;
  sex: Sex;
  hasPassport: boolean;
  countryOfOrigin?: string;
  passportNumber?: string;
  notes?: string;
}

// Helper functions
export const getPetTypeLabel = (type: PetType): string => {
  switch (type) {
    case PetType.DOG:
      return 'Perro'; // TODO: Add to translation dictionary
    case PetType.CAT:
      return 'Gato'; // TODO: Add to translation dictionary
    case PetType.FERRET:
      return 'Hurón'; // TODO: Add to translation dictionary
    default:
      return type;
  }
};

export const getPetSizeLabel = (size: PetSize): string => {
  switch (size) {
    case PetSize.SMALL:
      return 'Pequeño'; // TODO: Add to translation dictionary
    case PetSize.MEDIUM:
      return 'Mediano'; // TODO: Add to translation dictionary
    case PetSize.LARGE:
      return 'Grande'; // TODO: Add to translation dictionary
    default:
      return size;
  }
};

export const getSexLabel = (sex: Sex): string => {
  switch (sex) {
    case Sex.MALE:
      return 'Macho'; // TODO: Add to translation dictionary
    case Sex.FEMALE:
      return 'Hembra'; // TODO: Add to translation dictionary
    default:
      return sex;
  }
};