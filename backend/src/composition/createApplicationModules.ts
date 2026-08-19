import { createAppointmentModule, type AppointmentModule } from '../contexts/appointment/index.js';
import { createIdentityModule, type IdentityModule } from '../contexts/auth/index.js';
import { prisma } from '../db/prisma.js';
import { createHealthModule, type HealthModule } from '../contexts/health/index.js';
import { createPetCareModule, type PetCareModule } from '../contexts/pet/index.js';
import { createChatModule, type ChatModule } from '../contexts/chat/index.js';
import { createCommunityModule, type CommunityModule } from '../contexts/Posts/index.js';
import { ReminderService } from '../contexts/reminder/ReminderService.js';

export interface ApplicationModules {
  appointments: AppointmentModule;
  identity: IdentityModule;
  health: HealthModule;
  petCare: PetCareModule;
  chat: ChatModule;
  community: CommunityModule;
}

export function createApplicationModules(): ApplicationModules {
  const reminders = new ReminderService(prisma);
  const health = createHealthModule(prisma, reminders);
  return {
    appointments: createAppointmentModule(prisma),
    identity: createIdentityModule(),
    health,
    petCare: createPetCareModule(prisma, reminders),
    chat: createChatModule(prisma),
    community: createCommunityModule(prisma),
  };
}
