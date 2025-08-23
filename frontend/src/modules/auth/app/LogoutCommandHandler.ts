import type { AuthRepository } from '../domain/AuthRepository';
import type { LogoutCommand } from './LogoutCommand';

/**
 * Handler for LogoutCommand following CQRS pattern.
 * Orchestrates logout through domain repository.
 */
export class LogoutCommandHandler {
  private readonly authRepository: AuthRepository;
  
  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(_command: LogoutCommand): Promise<void> {
    await this.authRepository.logout();
  }
}
