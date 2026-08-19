-- Expand the enum first so this migration works both from the original
-- migration history and on databases previously synchronized with db push.
ALTER TABLE `VolunteerPost`
  MODIFY `category` ENUM(
    'GENERAL',
    'URGENT',
    'EVENT',
    'VOLUNTEER_NEEDED',
    'ANNOUNCEMENT',
    'WALKING_EXERCISE',
    'PET_SITTING',
    'VET_TRANSPORT',
    'FOSTER_CARE',
    'TRAINING_BEHAVIOR',
    'SHELTER_SUPPORT',
    'GROOMING_HYGIENE',
    'MEDICAL_SUPPORT',
    'ADOPTION_REHOMING',
    'LOST_AND_FOUND'
  ) NOT NULL DEFAULT 'GENERAL';

UPDATE `VolunteerPost`
SET `category` = 'GENERAL'
WHERE `category` IN ('URGENT', 'EVENT', 'VOLUNTEER_NEEDED', 'ANNOUNCEMENT');

ALTER TABLE `VolunteerPost`
  MODIFY `category` ENUM(
    'GENERAL',
    'WALKING_EXERCISE',
    'PET_SITTING',
    'VET_TRANSPORT',
    'FOSTER_CARE',
    'TRAINING_BEHAVIOR',
    'SHELTER_SUPPORT',
    'GROOMING_HYGIENE',
    'MEDICAL_SUPPORT',
    'ADOPTION_REHOMING',
    'LOST_AND_FOUND'
  ) NOT NULL DEFAULT 'GENERAL';
