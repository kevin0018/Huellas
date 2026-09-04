import type { TranslationKey } from '../../i18n/dictionary';
import { PetType } from '../../modules/pet/domain/Pet';

export const petTypeTranslationKeys: Record<PetType, TranslationKey> = {
  [PetType.DOG]: 'petTypeDog',
  [PetType.CAT]: 'petTypeCat',
  [PetType.FERRET]: 'petTypeFerret',
};
