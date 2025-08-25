import { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository.js';
import { GetAppointmentsByPetQuery } from './GetAppointmentsByPetQuery.js';
import { Appointment } from '../../../domain/entities/Appointment.js';

export class GetAppointmentsByPetQueryHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(query: GetAppointmentsByPetQuery): Promise<Appointment[]> {
    return await this.appointmentRepository.findByPetId(query.petId);
  }
}
