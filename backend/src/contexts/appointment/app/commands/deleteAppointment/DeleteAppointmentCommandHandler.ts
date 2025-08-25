import { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository.js';
import { DeleteAppointmentCommand } from './DeleteAppointmentCommand.js';

export class DeleteAppointmentCommandHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async handle(command: DeleteAppointmentCommand): Promise<void> {
    // Verify ownership before deletion
    const hasOwnership = await this.appointmentRepository.verifyOwnership(
      command.appointmentId, 
      command.ownerId
    );
    
    if (!hasOwnership) {
      throw new Error('Appointment not found or access denied');
    }

    await this.appointmentRepository.delete(command.appointmentId);
  }
}
