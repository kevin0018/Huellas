import type { AuthRepository } from '../../domain/AuthRepository';
import type { User } from '../../domain/User';
import { UpdateProfileCommand } from './UpdateProfileCommand';

export class UpdateProfileCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async handle(command: UpdateProfileCommand): Promise<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const updatedUser = await this.authRepository.updateProfile(token, {
      name: command.name,
      lastName: command.lastName,
      email: command.email
    });

    // Update user data in localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    return updatedUser;
  }
}
