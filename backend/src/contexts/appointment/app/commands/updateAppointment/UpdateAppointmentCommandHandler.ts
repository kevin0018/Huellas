import { AppointmentRepository, AppointmentUpdateData } from '../../../domain/repositories/AppointmentRepository.js';
import { UpdateAppointmentCommand } from './UpdateAppointmentCommand.js';
import { Appointment } from '../../../domain/entities/Appointment.js';

export class UpdateAppointmentCommandHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(command: UpdateAppointmentCommand): Promise<Appointment> {
    // Verify ownership
    const hasOwnership = await this.appointmentRepository.verifyOwnership(
      command.appointmentId, 
      command.ownerId
    );
    
    if (!hasOwnership) {
      throw new Error('Appointment not found or access denied');
    }

    const updateData: AppointmentUpdateData = {};
    
    if (command.date !== undefined) updateData.date = command.date;
    if (command.reason !== undefined) updateData.reason = command.reason;
    if (command.notes !== undefined) updateData.notes = command.notes;

    return await this.appointmentRepository.update(command.appointmentId, updateData);
  }
}
