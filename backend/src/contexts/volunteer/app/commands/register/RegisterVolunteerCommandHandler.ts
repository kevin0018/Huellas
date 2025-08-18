import { RegisterVolunteerCommand } from './RegisterVolunteerCommand.js';
import { VolunteerRepository } from '../../../domain/repositories/VolunteerRepository.js';
import { Volunteer } from '../../../domain/entities/Volunteer.js';
import { VolunteerId } from '../../../domain/value-objects/VolunteerId.js';

export class RegisterVolunteerCommandHandler {
  constructor(private volunteerRepository: VolunteerRepository) {}

  async execute(command: RegisterVolunteerCommand): Promise<{ id: number; message: string }> {
    const volunteer = Volunteer.create(
      new VolunteerId(1),
      command.name,
      command.lastName,
      command.email,
      command.password,
      command.description
    );

    const generatedId = await this.volunteerRepository.save(volunteer);

    return {
      id: generatedId,
      message: 'Volunteer registered successfully'
    };
  }
}
