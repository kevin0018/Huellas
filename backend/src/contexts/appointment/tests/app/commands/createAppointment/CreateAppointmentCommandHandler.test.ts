import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateAppointmentCommandHandler } from '../../../../app/commands/createAppointment/CreateAppointmentCommandHandler.js';
import { CreateAppointmentCommand } from '../../../../app/commands/createAppointment/CreateAppointmentCommand.js';
import { AppointmentRepository } from '../../../../domain/repositories/AppointmentRepository.js';
import { Appointment, AppointmentReason } from '../../../../domain/entities/Appointment.js';

describe('CreateAppointmentCommandHandler', () => {
  let handler: CreateAppointmentCommandHandler;
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

    handler = new CreateAppointmentCommandHandler(mockRepository);
  });

  it('should create appointment successfully when pet belongs to owner', async () => {
    // Arrange
    const command = new CreateAppointmentCommand(
      1, // ownerId
      2, // petId
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      'Annual vaccination'
    );

    const expectedAppointment = Appointment.create(
      1,
      2,
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      'Annual vaccination'
    );

    (mockRepository.verifyPetOwnership as any).mockResolvedValue(true);
    (mockRepository.create as any).mockResolvedValue(expectedAppointment);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.verifyPetOwnership).toHaveBeenCalledWith(2, 1);
    expect(mockRepository.create).toHaveBeenCalledWith({
      petId: 2,
      date: new Date('2025-09-15'),
      reason: AppointmentReason.VACCINATION,
      notes: 'Annual vaccination'
    });
    expect(result).toBe(expectedAppointment);
  });

  it('should throw error when pet does not belong to owner', async () => {
    // Arrange
    const command = new CreateAppointmentCommand(
      1, // ownerId
      999, // petId that doesn't belong to owner
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      'Annual vaccination'
    );

    (mockRepository.verifyPetOwnership as any).mockResolvedValue(false);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Pet not found or does not belong to this owner');
    expect(mockRepository.verifyPetOwnership).toHaveBeenCalledWith(999, 1);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should create appointment with empty notes when notes is undefined', async () => {
    // Arrange
    const command = new CreateAppointmentCommand(
      1, // ownerId
      2, // petId
      new Date('2025-09-15'),
      AppointmentReason.GENERAL_CHECKUP
      // notes is undefined
    );

    const expectedAppointment = Appointment.create(
      1,
      2,
      new Date('2025-09-15'),
      AppointmentReason.GENERAL_CHECKUP
    );

    (mockRepository.verifyPetOwnership as any).mockResolvedValue(true);
    (mockRepository.create as any).mockResolvedValue(expectedAppointment);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.create).toHaveBeenCalledWith({
      petId: 2,
      date: new Date('2025-09-15'),
      reason: AppointmentReason.GENERAL_CHECKUP,
      notes: undefined
    });
    expect(result).toBe(expectedAppointment);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const command = new CreateAppointmentCommand(
      1,
      2,
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      'Annual vaccination'
    );

    (mockRepository.verifyPetOwnership as any).mockResolvedValue(true);
    (mockRepository.create as any).mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Database connection failed');
    expect(mockRepository.verifyPetOwnership).toHaveBeenCalledWith(2, 1);
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
