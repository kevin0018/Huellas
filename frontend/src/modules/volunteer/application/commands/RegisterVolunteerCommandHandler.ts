import type { VolunteerRepository } from '../../domain/VolunteerRepository';
import { Volunteer } from '../../domain/Volunteer';
import { RegisterVolunteerCommand } from './RegisterVolunteerCommand';

export class RegisterVolunteerCommandHandler {
  private readonly volunteerRepository: VolunteerRepository;

  constructor(volunteerRepository: VolunteerRepository) {
    this.volunteerRepository = volunteerRepository;
  }

  async execute(command: RegisterVolunteerCommand): Promise<void> {
    const volunteer = Volunteer.create({
      name: command.name,
      lastName: command.lastName,
      email: command.email,
      password: command.password,
      description: command.description,
    });
    await this.volunteerRepository.register(volunteer);
  }
}
