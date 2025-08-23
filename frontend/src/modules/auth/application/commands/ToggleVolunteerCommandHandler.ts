import type { AuthRepository } from '../../domain/AuthRepository';
import type { User } from '../../domain/User';
import { ToggleVolunteerCommand } from './ToggleVolunteerCommand';

export class ToggleVolunteerCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async handle(command: ToggleVolunteerCommand): Promise<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate description if becoming a volunteer
    if (command.isBecomingVolunteer && !command.description?.trim()) {
      throw new Error('Description is required to become a volunteer');
    }

    const updatedUser = await this.authRepository.toggleVolunteer(
      token,
      command.isBecomingVolunteer ? { description: command.description! } : undefined
    );

    // Update user data in localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    return updatedUser;
  }
}
