import { DeleteVolunteerCommand } from './DeleteVolunteerCommand.js';
import { VolunteerRepository } from '../../../domain/repositories/VolunteerRepository.js';
import { VolunteerId } from '../../../domain/value-objects/VolunteerId.js';

export class DeleteVolunteerCommandHandler {
  constructor(private volunteerRepository: VolunteerRepository) {}

  async execute(command: DeleteVolunteerCommand): Promise<{ message: string }> {
    const volunteerId = new VolunteerId(command.volunteerId);
    
    const volunteer = await this.volunteerRepository.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    if (!volunteer.canBeDeletedBy(command.requestingUserId)) {
      throw new Error('You can only delete your own account');
    }

    await this.volunteerRepository.delete(volunteerId);

    return {
      message: 'Volunteer account successfully deleted'
    };
  }
}
