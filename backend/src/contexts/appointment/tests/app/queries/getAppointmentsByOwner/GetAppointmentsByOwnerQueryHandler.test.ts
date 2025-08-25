import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAppointmentsByOwnerQueryHandler } from '../../../../app/queries/getAppointmentsByOwner/GetAppointmentsByOwnerQueryHandler.js';
import { GetAppointmentsByOwnerQuery } from '../../../../app/queries/getAppointmentsByOwner/GetAppointmentsByOwnerQuery.js';
import { AppointmentRepository } from '../../../../domain/repositories/AppointmentRepository.js';
import { Appointment, AppointmentReason } from '../../../../domain/entities/Appointment.js';

describe('GetAppointmentsByOwnerQueryHandler', () => {
  let handler: GetAppointmentsByOwnerQueryHandler;
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

    handler = new GetAppointmentsByOwnerQueryHandler(mockRepository);
  });

  it('should return all appointments for the owner', async () => {
    // Arrange
    const query = new GetAppointmentsByOwnerQuery(1);

    const mockAppointments = [
      Appointment.fromDatabase(
        1,
        2,
        new Date('2025-09-15'),
        AppointmentReason.VACCINATION,
        'Vaccination for pet 1'
      ),
      Appointment.fromDatabase(
        2,
        3,
        new Date('2025-09-20'),
        AppointmentReason.GENERAL_CHECKUP,
        'Checkup for pet 2'
      )
    ];

    (mockRepository.findByOwner as any).mockResolvedValue(mockAppointments);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.findByOwner).toHaveBeenCalledWith(1);
    expect(result).toBe(mockAppointments);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when owner has no appointments', async () => {
    // Arrange
    const query = new GetAppointmentsByOwnerQuery(1);

    (mockRepository.findByOwner as any).mockResolvedValue([]);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockRepository.findByOwner).toHaveBeenCalledWith(1);
    expect(result).toEqual([]);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const query = new GetAppointmentsByOwnerQuery(1);

    (mockRepository.findByOwner as any).mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(handler.handle(query)).rejects.toThrow('Database connection failed');
    expect(mockRepository.findByOwner).toHaveBeenCalledWith(1);
  });

  it('should handle different owner IDs correctly', async () => {
    // Arrange
    const query1 = new GetAppointmentsByOwnerQuery(1);
    const query2 = new GetAppointmentsByOwnerQuery(2);

    const mockAppointmentsOwner1 = [
      Appointment.fromDatabase(1, 2, new Date('2025-09-15'), AppointmentReason.VACCINATION, 'Notes 1')
    ];
    const mockAppointmentsOwner2 = [
      Appointment.fromDatabase(2, 4, new Date('2025-09-20'), AppointmentReason.OPERATION, 'Notes 2')
    ];

    (mockRepository.findByOwner as any)
      .mockResolvedValueOnce(mockAppointmentsOwner1)
      .mockResolvedValueOnce(mockAppointmentsOwner2);

    // Act
    const result1 = await handler.handle(query1);
    const result2 = await handler.handle(query2);

    // Assert
    expect(mockRepository.findByOwner).toHaveBeenCalledWith(1);
    expect(mockRepository.findByOwner).toHaveBeenCalledWith(2);
    expect(result1).toBe(mockAppointmentsOwner1);
    expect(result2).toBe(mockAppointmentsOwner2);
  });
});
