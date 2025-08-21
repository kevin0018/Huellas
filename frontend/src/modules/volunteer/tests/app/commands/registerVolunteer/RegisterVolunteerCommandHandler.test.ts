import { describe, it, expect, vi } from 'vitest';
import { RegisterVolunteerCommand } from '../../../../application/commands/RegisterVolunteerCommand';
import { RegisterVolunteerCommandHandler } from '../../../../application/commands/RegisterVolunteerCommandHandler';
import { Volunteer } from '../../../../domain/Volunteer';


describe('RegisterVolunteerCommandHandler', () => {
  it('should call repository with Volunteer instance', async () => {
    // Arrange
    const mockRepository = {
      register: vi.fn().mockResolvedValue(undefined)
    };
    const handler = new RegisterVolunteerCommandHandler(mockRepository);
    const command = new RegisterVolunteerCommand(
      'Ana',
      'García',
      'ana@example.com',
      'securePassword123',
      'Me encantan los animales y quiero ayudar.'
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(mockRepository.register).toHaveBeenCalledTimes(1);
    const volunteerArg = mockRepository.register.mock.calls[0][0];
    expect(volunteerArg).toBeInstanceOf(Volunteer);
    expect(volunteerArg.name).toBe('Ana');
    expect(volunteerArg.lastName).toBe('García');
    expect(volunteerArg.email).toBe('ana@example.com');
    expect(volunteerArg.password).toBe('securePassword123');
    expect(volunteerArg.description).toBe('Me encantan los animales y quiero ayudar.');
  });

  it('should throw if repository fails', async () => {
    // Arrange
    const mockRepository = {
      register: vi.fn().mockRejectedValue(new Error('API error'))
    };
    const handler = new RegisterVolunteerCommandHandler(mockRepository);
    const command = new RegisterVolunteerCommand(
      'Luis',
      'Martínez',
      'luis@example.com',
      'password456',
      'Quiero colaborar en la protectora.'
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow('API error');
  });
});
