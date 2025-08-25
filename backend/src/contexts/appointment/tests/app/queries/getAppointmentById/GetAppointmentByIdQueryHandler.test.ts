import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAppointmentByIdQueryHandler } from '../../../../app/queries/getAppointmentById/GetAppointmentByIdQueryHandler.js';
import { GetAppointmentByIdQuery } from '../../../../app/queries/getAppointmentById/GetAppointmentByIdQuery.js';
import { AppointmentRepository } from '../../../../domain/repositories/AppointmentRepository.js';
import { Appointment, AppointmentReason } from '../../../../domain/entities/Appointment.js';

describe('GetAppointmentByIdQueryHandler', () => {
  let handler: GetAppointmentByIdQueryHandler;
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

    handler = new GetAppointmentByIdQueryHandler(mockRepository);
  });

  it('should return appointment when it belongs to the owner', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(1, 1); // appointmentId, ownerId

    const mockAppointment = Appointment.fromDatabase(
      1,
      2,
      new Date('2025-09-15'),
      AppointmentReason.VACCINATION,
      'Vaccination notes'
    );

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.findById as any).mockResolvedValue(mockAppointment);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(mockAppointment);
  });

  it('should return null when appointment does not belong to owner', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(1, 999); // appointmentId, wrong ownerId

    (mockRepository.verifyOwnership as any).mockResolvedValue(false);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 999);
    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when appointment does not exist', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(999, 1); // non-existent appointmentId

    (mockRepository.verifyOwnership as any).mockResolvedValue(false); // ownership check fails for non-existent appointment

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(999, 1);
    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(1, 1);

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.findById as any).mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(handler.handle(query)).rejects.toThrow('Database connection failed');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should handle ownership verification errors gracefully', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(1, 1);

    (mockRepository.verifyOwnership as any).mockRejectedValue(new Error('Ownership verification failed'));

    // Act & Assert
    await expect(handler.handle(query)).rejects.toThrow('Ownership verification failed');
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return appointment even if findById returns null after successful ownership check', async () => {
    // Arrange
    const query = new GetAppointmentByIdQuery(1, 1);

    (mockRepository.verifyOwnership as any).mockResolvedValue(true);
    (mockRepository.findById as any).mockResolvedValue(null); // appointment was deleted between checks

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.verifyOwnership).toHaveBeenCalledWith(1, 1);
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBeNull();
  });
});
