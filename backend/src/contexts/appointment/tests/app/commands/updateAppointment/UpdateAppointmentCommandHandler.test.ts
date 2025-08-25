import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateAppointmentCommandHandler } from '../../../../app/commands/updateAppointment/UpdateAppointmentCommandHandler.js';
import { UpdateAppointmentCommand } from '../../../../app/commands/updateAppointment/UpdateAppointmentCommand.js';
import { AppointmentRepository } from '../../../../domain/repositories/AppointmentRepository.js';
import { Appointment, AppointmentReason } from '../../../../domain/entities/Appointment.js';

describe('UpdateAppointmentCommandHandler', () => {
  let handler: UpdateAppointmentCommandHandler;
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

    handler = new UpdateAppointmentCommandHandler(mockRepository);
  });

  it('should update appointment successfully when owner has access', async () => {
    // Arrange
    const command = new UpdateAppointmentCommand(
      1, // appointmentId
      1, // ownerId
      new Date('2025-09-16'),
      AppointmentReason.GENERAL_CHECKUP,
      'Updated notes'
    );

    const updatedAppointment = Appointment.fromDatabase(
      1,
      2,
      new Date('2025-09-16'),
      AppointmentReason.GENERAL_CHECKUP,
      'Updated notes'
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.update as any).mockResolvedValue(updatedAppointment);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      date: new Date('2025-09-16'),
      reason: AppointmentReason.GENERAL_CHECKUP,
      notes: 'Updated notes'
    });
    expect(result).toBe(updatedAppointment);
  });

  it('should throw error when appointment does not belong to owner', async () => {
    // Arrange
    const command = new UpdateAppointmentCommand(
      1, // appointmentId
      999, // ownerId that doesn't own the appointment
      new Date('2025-09-16'),
      AppointmentReason.GENERAL_CHECKUP,
      'Updated notes'
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(false);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Appointment not found or access denied');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 999);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should update only provided fields', async () => {
    // Arrange
    const command = new UpdateAppointmentCommand(
      1, // appointmentId
      1, // ownerId
      undefined, // date not updated
      AppointmentReason.OPERATION, // only reason updated
      undefined // notes not updated
    );

    const updatedAppointment = Appointment.fromDatabase(
      1,
      2,
      new Date('2025-09-15'), // original date preserved
      AppointmentReason.OPERATION,
      'Original notes' // original notes preserved
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.update as any).mockResolvedValue(updatedAppointment);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      reason: AppointmentReason.OPERATION
    });
    expect(result).toBe(updatedAppointment);
  });

  it('should handle empty notes update', async () => {
    // Arrange
    const command = new UpdateAppointmentCommand(
      1, // appointmentId
      1, // ownerId
      undefined,
      undefined,
      '' // explicitly setting notes to empty string
    );

    const updatedAppointment = Appointment.fromDatabase(
      1,
      2,
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      ''
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.update as any).mockResolvedValue(updatedAppointment);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      notes: ''
    });
    expect(result).toBe(updatedAppointment);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const command = new UpdateAppointmentCommand(
      1,
      1,
      new Date('2025-09-16'),
      AppointmentReason.GENERAL_CHECKUP,
      'Updated notes'
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.update as any).mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Database connection failed');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.update).toHaveBeenCalled();
  });
});
