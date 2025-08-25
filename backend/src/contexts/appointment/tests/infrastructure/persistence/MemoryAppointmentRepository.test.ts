import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAppointmentRepository } from '../../../infrastructure/persistence/MemoryAppointmentRepository.js';
import { AppointmentReason } from '../../../domain/entities/Appointment.js';

describe('MemoryAppointmentRepository', () => {
  let repository: MemoryAppointmentRepository;

  beforeEach(() => {
    repository = new MemoryAppointmentRepository();
    repository.clear();
  });

  describe('create', () => {
    it('should create and return a new appointment', async () => {
      // Arrange
      const appointmentData = {
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Annual vaccination'
      };

      // Act
      const result = await repository.create(appointmentData);

      // Assert
      expect(result.id).toBe(1);
      expect(result.petId).toBe(1);
      expect(result.date).toEqual(new Date('2025-09-15'));
      expect(result.reason).toBe(AppointmentReason.VACCINATION);
      expect(result.notes).toBe('Annual vaccination');
    });

    it('should assign incremental IDs to multiple appointments', async () => {
      // Arrange
      const appointment1Data = {
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'First appointment'
      };

      const appointment2Data = {
        petId: 2,
        date: new Date('2025-09-20'),
        reason: AppointmentReason.GENERAL_CHECKUP,
        notes: 'Second appointment'
      };

      // Act
      const result1 = await repository.create(appointment1Data);
      const result2 = await repository.create(appointment2Data);

      // Assert
      expect(result1.id).toBe(1);
      expect(result2.id).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return appointment when it exists', async () => {
      // Arrange
      const appointmentData = {
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Test appointment'
      };
      const created = await repository.create(appointmentData);

      // Act
      const result = await repository.findById(created.id);

      // Assert
      expect(result).toBe(created);
    });

    it('should return null when appointment does not exist', async () => {
      // Act
      const result = await repository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByPetId', () => {
    it('should return appointments for specific pet', async () => {
      // Arrange
      repository.addTestPet(1, 1);
      repository.addTestPet(2, 1);

      await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Pet 1 appointment 1'
      });

      await repository.create({
        petId: 2,
        date: new Date('2025-09-16'),
        reason: AppointmentReason.GENERAL_CHECKUP,
        notes: 'Pet 2 appointment'
      });

      await repository.create({
        petId: 1,
        date: new Date('2025-09-17'),
        reason: AppointmentReason.OPERATION,
        notes: 'Pet 1 appointment 2'
      });

      // Act
      const result = await repository.findByPetId(1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].petId).toBe(1);
      expect(result[1].petId).toBe(1);
      // Should be sorted by date descending
      expect(result[0].date.getTime()).toBeGreaterThan(result[1].date.getTime());
    });

    it('should return empty array when pet has no appointments', async () => {
      // Act
      const result = await repository.findByPetId(999);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByOwner', () => {
    it('should return appointments for all pets owned by the owner', async () => {
      // Arrange
      repository.addTestPet(1, 1); // Pet 1 belongs to owner 1
      repository.addTestPet(2, 1); // Pet 2 belongs to owner 1
      repository.addTestPet(3, 2); // Pet 3 belongs to owner 2

      await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Owner 1 - Pet 1'
      });

      await repository.create({
        petId: 2,
        date: new Date('2025-09-16'),
        reason: AppointmentReason.GENERAL_CHECKUP,
        notes: 'Owner 1 - Pet 2'
      });

      await repository.create({
        petId: 3,
        date: new Date('2025-09-17'),
        reason: AppointmentReason.OPERATION,
        notes: 'Owner 2 - Pet 3'
      });

      // Act
      const result = await repository.findByOwner(1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((appointment) => [1, 2].includes(appointment.petId))).toBe(true);
    });

    it('should return empty array when owner has no pets or appointments', async () => {
      // Act
      const result = await repository.findByOwner(999);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update appointment successfully', async () => {
      // Arrange
      const created = await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Original notes'
      });

      // Act
      const result = await repository.update(created.id, {
        date: new Date('2025-09-16'),
        reason: AppointmentReason.GENERAL_CHECKUP,
        notes: 'Updated notes'
      });

      // Assert
      expect(result.id).toBe(created.id);
      expect(result.date).toEqual(new Date('2025-09-16'));
      expect(result.reason).toBe(AppointmentReason.GENERAL_CHECKUP);
      expect(result.notes).toBe('Updated notes');
    });

    it('should throw error when appointment does not exist', async () => {
      // Act & Assert
      await expect(repository.update(999, { notes: 'test' })).rejects.toThrow('Appointment not found');
    });
  });

  describe('delete', () => {
    it('should delete appointment successfully', async () => {
      // Arrange
      const created = await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'To be deleted'
      });

      // Act
      await repository.delete(created.id);

      // Assert
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should throw error when appointment does not exist', async () => {
      // Act & Assert
      await expect(repository.delete(999)).rejects.toThrow('Appointment not found');
    });
  });

  describe('verifyOwnership', () => {
    it('should return true when appointment belongs to owner', async () => {
      // Arrange
      repository.addTestPet(1, 1);
      const created = await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Test'
      });

      // Act
      const result = await repository.verifyOwnership(created.id, 1);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when appointment does not belong to owner', async () => {
      // Arrange
      repository.addTestPet(1, 1);
      const created = await repository.create({
        petId: 1,
        date: new Date('2025-09-15'),
        reason: AppointmentReason.VACCINATION,
        notes: 'Test'
      });

      // Act
      const result = await repository.verifyOwnership(created.id, 999);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when appointment does not exist', async () => {
      // Act
      const result = await repository.verifyOwnership(999, 1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verifyPetOwnership', () => {
    it('should return true when pet belongs to owner', async () => {
      // Arrange
      repository.addTestPet(1, 1);

      // Act
      const result = await repository.verifyPetOwnership(1, 1);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when pet does not belong to owner', async () => {
      // Arrange
      repository.addTestPet(1, 1);

      // Act
      const result = await repository.verifyPetOwnership(1, 999);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when pet does not exist', async () => {
      // Act
      const result = await repository.verifyPetOwnership(999, 1);

      // Assert
      expect(result).toBe(false);
    });
  });
});
