import { AppointmentRepository, AppointmentCreateData } from '../../../domain/repositories/AppointmentRepository.js';
import { CreateAppointmentCommand } from './CreateAppointmentCommand.js';
import { Appointment } from '../../../domain/entities/Appointment.js';

export class CreateAppointmentCommandHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(command: CreateAppointmentCommand): Promise<Appointment> {
    // Verify that the pet belongs to the owner before creating appointment
    const petBelongsToOwner = await this.appointmentRepository.verifyPetOwnership(
      command.petId, 
      command.ownerId
    );
    
    if (!petBelongsToOwner) {
      throw new Error('Pet not found or does not belong to this owner');
    }
    
    const appointmentData: AppointmentCreateData = {
      petId: command.petId,
      date: command.date,
      reason: command.reason,
      notes: command.notes
    };

    return await this.appointmentRepository.create(appointmentData);
  }
}
