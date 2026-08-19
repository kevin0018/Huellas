import { createAppointmentModule, type AppointmentModule } from '../contexts/appointment/index.js';
import { createIdentityModule, type IdentityModule } from '../contexts/auth/index.js';
import { prisma } from '../db/prisma.js';
import { createHealthModule, type HealthModule } from '../contexts/health/index.js';
import { createPetCareModule, type PetCareModule } from '../contexts/pet/index.js';
import { createChatModule, type ChatModule } from '../contexts/chat/index.js';
import { createCommunityModule, type CommunityModule } from '../contexts/Posts/index.js';

export interface ApplicationModules {
  appointments: AppointmentModule;
  identity: IdentityModule;
  health: HealthModule;
  petCare: PetCareModule;
  chat: ChatModule;
  community: CommunityModule;
}

export function createApplicationModules(): ApplicationModules {
  const health = createHealthModule(prisma);
  return {
    appointments: createAppointmentModule(prisma),
    identity: createIdentityModule(),
    health,
    petCare: createPetCareModule(),
    chat: createChatModule(prisma),
    community: createCommunityModule(prisma),
  };
}
