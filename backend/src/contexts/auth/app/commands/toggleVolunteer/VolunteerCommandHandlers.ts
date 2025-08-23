import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { CreateVolunteerProfileCommand, DeleteVolunteerProfileCommand } from './VolunteerCommands.js';

export class CreateVolunteerProfileCommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async handle(command: CreateVolunteerProfileCommand): Promise<void> {
    // Check if user already has volunteer profile
    const hasVolunteerProfile = await this.authRepository.hasVolunteerProfile(command.userId);
    if (hasVolunteerProfile) {
      throw new Error('User already has a volunteer profile');
    }

    // Create volunteer profile
    await this.authRepository.createVolunteerProfile(command.userId, command.description);
  }
}

export class DeleteVolunteerProfileCommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async handle(command: DeleteVolunteerProfileCommand): Promise<void> {
    // Check if user has volunteer profile
    const hasVolunteerProfile = await this.authRepository.hasVolunteerProfile(command.userId);
    if (!hasVolunteerProfile) {
      throw new Error('User does not have a volunteer profile');
    }

    // Delete volunteer profile
    await this.authRepository.deleteVolunteerProfile(command.userId);
  }
}
