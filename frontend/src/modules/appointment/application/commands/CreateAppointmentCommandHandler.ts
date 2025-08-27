import type { AppointmentRepository } from '../../domain/AppointmentRepository.js';
import type { Appointment } from '../../domain/Appointment.js';
import type { CreateAppointmentCommand } from './CreateAppointmentCommand.js';

export class CreateAppointmentCommandHandler {
  private repository: AppointmentRepository;

  constructor(repository: AppointmentRepository) {
    this.repository = repository;
  }

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    return this.repository.createAppointment(command.toRequest());
  }
}
