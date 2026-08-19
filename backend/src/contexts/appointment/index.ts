import type { PrismaClient } from '@prisma/client';
import { CreateAppointmentCommandHandler } from './app/commands/createAppointment/CreateAppointmentCommandHandler.js';
import { DeleteAppointmentCommandHandler } from './app/commands/deleteAppointment/DeleteAppointmentCommandHandler.js';
import { UpdateAppointmentCommandHandler } from './app/commands/updateAppointment/UpdateAppointmentCommandHandler.js';
import { GetAppointmentByIdQueryHandler } from './app/queries/getAppointmentById/GetAppointmentByIdQueryHandler.js';
import { GetAppointmentsByOwnerQueryHandler } from './app/queries/getAppointmentsByOwner/GetAppointmentsByOwnerQueryHandler.js';
import { AppointmentStatus } from './domain/entities/Appointment.js';
import { AppointmentController } from './infrastructure/controllers/AppointmentController.js';
import { PrismaAppointmentRepository } from './infrastructure/persistence/PrismaAppointmentRepository.js';

export interface AppointmentModule {
  controller: AppointmentController;
}

export function createAppointmentModule(prisma: PrismaClient): AppointmentModule {
  const repository = new PrismaAppointmentRepository(prisma);

  return {
    controller: new AppointmentController({
      createAppointment: new CreateAppointmentCommandHandler(repository),
      updateAppointment: new UpdateAppointmentCommandHandler(repository),
      deleteAppointment: new DeleteAppointmentCommandHandler(repository),
      getAppointmentsByOwner: new GetAppointmentsByOwnerQueryHandler(repository),
      getAppointmentById: new GetAppointmentByIdQueryHandler(repository),
      synchronizeReminder: async (appointmentId, status) => {
        if (status === AppointmentStatus.COMPLETED) {
          const now = new Date();
          await prisma.reminder.updateMany({
            where: { source_key: `appointment:${appointmentId}`, status: 'PENDING' },
            data: { status: 'COMPLETED', completed_at: now, generated_action_at: now },
          });
        } else if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.NO_SHOW) {
          await prisma.reminder.updateMany({
            where: { source_key: `appointment:${appointmentId}`, status: 'PENDING' },
            data: { status: 'CANCELLED', cancelled_at: new Date() },
          });
        }
      },
    }),
  };
}
