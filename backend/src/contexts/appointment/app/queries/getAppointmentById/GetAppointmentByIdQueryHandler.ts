import { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository.js';
import { GetAppointmentByIdQuery } from './GetAppointmentByIdQuery.js';
import { Appointment } from '../../../domain/entities/Appointment.js';

export class GetAppointmentByIdQueryHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(query: GetAppointmentByIdQuery): Promise<Appointment | null> {
    // Verify ownership first
    const hasOwnership = await this.appointmentRepository.verifyOwnership(
      query.appointmentId, 
      query.ownerId
    );
    
    if (!hasOwnership) {
      return null; // Return null instead of throwing error for queries
    }

    return await this.appointmentRepository.findById(query.appointmentId);
  }
}
