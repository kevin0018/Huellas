import type { TranslationKey } from '../../i18n/dictionary';
import type { PostCategory } from '../../modules/posts/domain/types';

export const postCategoryTranslationKeys: Record<PostCategory, TranslationKey> = {
  GENERAL: 'postCategoryGeneral',
  PET_SITTING: 'postCategoryPetSitting',
  WALKING_EXERCISE: 'postCategoryWalking',
  VET_TRANSPORT: 'postCategoryVetTransport',
  FOSTER_CARE: 'postCategoryFosterCare',
  TRAINING_BEHAVIOR: 'postCategoryTraining',
  SHELTER_SUPPORT: 'postCategoryShelterSupport',
  GROOMING_HYGIENE: 'postCategoryGrooming',
  MEDICAL_SUPPORT: 'postCategoryMedicalSupport',
  ADOPTION_REHOMING: 'postCategoryAdoption',
  LOST_AND_FOUND: 'postCategoryLostFound',
};

export const postCategories = Object.keys(postCategoryTranslationKeys) as PostCategory[];
