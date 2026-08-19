import { createAppointmentModule, type AppointmentModule } from '../contexts/appointment/index.js';
import { createIdentityModule, type IdentityModule } from '../contexts/auth/index.js';
import { prisma } from '../db/prisma.js';
import { createHealthModule, type HealthModule } from '../contexts/health/index.js';
import { createPetCareModule, type PetCareModule } from '../contexts/pet/index.js';
import { createChatModule, type ChatModule } from '../contexts/chat/index.js';
import { createCommunityModule, type CommunityModule } from '../contexts/Posts/index.js';
import { ReminderService } from '../contexts/reminder/ReminderService.js';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { UserType } from '../contexts/auth/domain/entities/UserAuth.js';

export interface ApplicationModules {
  appointments: AppointmentModule;
  identity: IdentityModule;
  health: HealthModule;
  petCare: PetCareModule;
  chat: ChatModule;
  community: CommunityModule;
}

export function createApplicationModules(): ApplicationModules {
  JwtMiddleware.configure({
    findUserAccess: async (userId) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { type: true, owner: { select: { id: true } }, volunteer: { select: { id: true } } },
      });
      return user ? { ...user, type: user.type as UserType } : null;
    },
    findPetOwner: (petId) => prisma.pet.findUnique({ where: { id: petId }, select: { owner_id: true } }),
  });
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
