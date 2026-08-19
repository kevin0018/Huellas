import { createAppointmentModule, type AppointmentModule } from '../contexts/appointment/index.js';
import { prisma } from '../db/prisma.js';

export interface ApplicationModules {
  appointments: AppointmentModule;
}

export function createApplicationModules(): ApplicationModules {
  return {
    appointments: createAppointmentModule(prisma),
  };
}
