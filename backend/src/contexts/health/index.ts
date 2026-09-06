import type { PrismaClient } from '@prisma/client';
import { HealthDocumentController } from './HealthDocumentController.js';
import { HealthEventController } from './HealthEventController.js';
import { HealthShareController } from './HealthShareController.js';
import { ReminderController } from '../reminder/ReminderController.js';
import { HealthRecordService } from './app/HealthRecordService.js';
import { HealthShareService } from './app/HealthShareService.js';
import { ReminderApplicationService } from '../reminder/ReminderApplicationService.js';
import type { ReminderService } from '../reminder/ReminderService.js';

export interface HealthModule {
  documents: HealthDocumentController;
  events: HealthEventController;
  reminders: ReminderController;
  shares: HealthShareController;
}

export function createHealthModule(prisma: PrismaClient, reminderService: ReminderService): HealthModule {
  const healthRecords = new HealthRecordService(prisma, reminderService);
  const healthShares = new HealthShareService(prisma);
  const reminders = new ReminderApplicationService(prisma, reminderService);
  return {
    documents: new HealthDocumentController(healthRecords),
    events: new HealthEventController(healthRecords),
    reminders: new ReminderController(reminders),
    shares: new HealthShareController(healthShares),
  };
}
