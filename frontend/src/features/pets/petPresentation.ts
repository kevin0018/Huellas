import type { TranslationKey } from '../../i18n/dictionary';
import { PetType, PetSize, Sex } from '../../modules/pet/domain/Pet';

export const petTypeTranslationKeys: Record<PetType, TranslationKey> = {
  [PetType.DOG]: 'petTypeDog',
  [PetType.CAT]: 'petTypeCat',
  [PetType.FERRET]: 'petTypeFerret',
};

export const petSizeTranslationKeys: Record<PetSize, TranslationKey> = {
  [PetSize.SMALL]: 'petSizeSmall',
  [PetSize.MEDIUM]: 'petSizeMedium',
  [PetSize.LARGE]: 'petSizeLarge',
};

export const petSexTranslationKeys: Record<Sex, TranslationKey> = {
  [Sex.MALE]: 'petSexMale',
  [Sex.FEMALE]: 'petSexFemale',
};
