import type { AppointmentRepository } from '../../domain/AppointmentRepository.js';
import type { Appointment } from '../../domain/Appointment.js';
import type { GetAppointmentsQuery } from './GetAppointmentsQuery.js';

export class GetAppointmentsQueryHandler {
  private repository: AppointmentRepository;

  constructor(repository: AppointmentRepository) {
    this.repository = repository;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_query: GetAppointmentsQuery): Promise<Appointment[]> {
    return this.repository.getAppointments();
  }
}
