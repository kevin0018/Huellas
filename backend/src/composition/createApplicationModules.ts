import { createAppointmentModule, type AppointmentModule } from '../contexts/appointment/index.js';
import { createIdentityModule, type IdentityModule } from '../contexts/auth/index.js';
import { prisma } from '../db/prisma.js';

export interface ApplicationModules {
  appointments: AppointmentModule;
  identity: IdentityModule;
}

export function createApplicationModules(): ApplicationModules {
  return {
    appointments: createAppointmentModule(prisma),
    identity: createIdentityModule(),
  };
}
