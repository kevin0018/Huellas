import { ApiCheckupRepository } from '../modules/checkup/infra/ApiCheckupRepository.js';
import { ApiHealthEventRepository } from '../modules/health/ApiHealthEventRepository.js';
import { ApiPetRepository } from '../modules/pet/infra/ApiPetRepository.js';
import { ApiReminderRepository } from '../modules/reminder/ApiReminderRepository.js';

export type { ReminderFeed } from '../modules/reminder/ApiReminderRepository.js';

/**
 * Application-wide adapters used by the React delivery layer.
 *
 * Keeping their construction here prevents views from knowing which concrete
 * HTTP implementation fulfils each domain capability and gives tests one
 * composition boundary to replace when needed.
 */
export function createApplicationServices() {
  return {
    checkups: new ApiCheckupRepository(),
    healthEvents: new ApiHealthEventRepository(),
    pets: new ApiPetRepository(),
    reminders: new ApiReminderRepository(),
  } as const;
}

export const applicationServices = createApplicationServices();
