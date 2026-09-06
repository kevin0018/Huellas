import { describe, expect, it } from 'vitest';
import { ApiCheckupRepository } from '../modules/checkup/infra/ApiCheckupRepository.js';
import { ApiHealthEventRepository } from '../modules/health/ApiHealthEventRepository.js';
import { ApiPetRepository } from '../modules/pet/infra/ApiPetRepository.js';
import { ApiReminderRepository } from '../modules/reminder/ApiReminderRepository.js';
import { applicationServices, createApplicationServices } from './applicationServices.js';

describe('applicationServices', () => {
  it('composes the HTTP adapters outside React views', () => {
    const services = createApplicationServices();

    expect(services.pets).toBeInstanceOf(ApiPetRepository);
    expect(services.checkups).toBeInstanceOf(ApiCheckupRepository);
    expect(services.healthEvents).toBeInstanceOf(ApiHealthEventRepository);
    expect(services.reminders).toBeInstanceOf(ApiReminderRepository);
  });

  it('keeps the exported composition separate from newly created test compositions', () => {
    const services = createApplicationServices();

    expect(applicationServices.pets).not.toBe(services.pets);
    expect(applicationServices.healthEvents).not.toBe(services.healthEvents);
  });
});
