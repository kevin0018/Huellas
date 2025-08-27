import { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository.js';
import { GetAppointmentsByOwnerQuery } from './GetAppointmentsByOwnerQuery.js';
import { Appointment } from '../../../domain/entities/Appointment.js';

export class GetAppointmentsByOwnerQueryHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(query: GetAppointmentsByOwnerQuery): Promise<Appointment[]> {
    return await this.appointmentRepository.findByOwner(query.ownerId);
  }
}
