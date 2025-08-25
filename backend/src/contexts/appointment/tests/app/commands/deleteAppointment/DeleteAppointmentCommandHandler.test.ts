import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteAppointmentCommandHandler } from '../../../../app/commands/deleteAppointment/DeleteAppointmentCommandHandler.js';
import { DeleteAppointmentCommand } from '../../../../app/commands/deleteAppointment/DeleteAppointmentCommand.js';
import { AppointmentRepository } from '../../../../domain/repositories/AppointmentRepository.js';

describe('DeleteAppointmentCommandHandler', () => {
  let handler: DeleteAppointmentCommandHandler;
  let mockRepository: AppointmentRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByPetId: vi.fn(),
      findByOwner: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      verifyOwnership: vi.fn(),
      verifyPetOwnership: vi.fn()
    };

    handler = new DeleteAppointmentCommandHandler(mockRepository);
  });

  it('should delete appointment successfully when owner has access', async () => {
    // Arrange
    const command = new DeleteAppointmentCommand(1, 1); // appointmentId, ownerId

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.delete as any).mockResolvedValue(undefined);

    // Act
    await handler.handle(command);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw error when appointment does not belong to owner', async () => {
    // Arrange
    const command = new DeleteAppointmentCommand(1, 999); // appointmentId, wrong ownerId

    (mockRepository.verifyOwnership as any).mockResolvedValue(false);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Appointment not found or access denied');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 999);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const command = new DeleteAppointmentCommand(1, 1);

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.delete as any).mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Database connection failed');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should handle verification errors gracefully', async () => {
    // Arrange
    const command = new DeleteAppointmentCommand(1, 1);

    (mockRepository.verifyOwnership as any).mockRejectedValue(new Error('Verification failed'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Verification failed');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
