import { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository.js';
import { GetAppointmentsByOwnerQuery } from './GetAppointmentsByOwnerQuery.js';
import { Appointment, AppointmentStatus } from '../../../domain/entities/Appointment.js';

export class GetAppointmentsByOwnerQueryHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(query: GetAppointmentsByOwnerQuery): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.findByOwner(query.ownerId);
    const now = Date.now();
    return appointments.sort((left, right) => {
      const leftUpcoming = left.status === AppointmentStatus.SCHEDULED && left.date.getTime() >= now;
      const rightUpcoming = right.status === AppointmentStatus.SCHEDULED && right.date.getTime() >= now;
      if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
      return leftUpcoming
        ? left.date.getTime() - right.date.getTime()
        : right.date.getTime() - left.date.getTime();
    });
  }
}
