import type { PrismaClient } from '@prisma/client';
import { HealthDocumentController } from './HealthDocumentController.js';
import { HealthEventController } from './HealthEventController.js';
import { HealthShareController } from './HealthShareController.js';
import { ReminderController } from '../reminder/ReminderController.js';

export interface HealthModule {
  documents: HealthDocumentController;
  events: HealthEventController;
  reminders: ReminderController;
  shares: HealthShareController;
}

export function createHealthModule(prisma: PrismaClient): HealthModule {
  return {
    documents: new HealthDocumentController(prisma),
    events: new HealthEventController(prisma),
    reminders: new ReminderController(prisma),
    shares: new HealthShareController(prisma),
  };
}
