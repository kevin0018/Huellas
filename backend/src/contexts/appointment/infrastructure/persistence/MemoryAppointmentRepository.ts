import { AppointmentRepository, AppointmentCreateData, AppointmentUpdateData } from '../../domain/repositories/AppointmentRepository.js';
import { Appointment } from '../../domain/entities/Appointment.js';

export class MemoryAppointmentRepository implements AppointmentRepository {
  private appointments: Map<number, Appointment> = new Map();
  private pets: Map<number, { id: number; ownerId: number }> = new Map();
  private nextId: number = 1;

  // Helper method to add test pets
  addTestPet(petId: number, ownerId: number): void {
    this.pets.set(petId, { id: petId, ownerId });
  }

  // Helper method to clear all data
  clear(): void {
    this.appointments.clear();
    this.pets.clear();
    this.nextId = 1;
  }

  async findById(id: number): Promise<Appointment | null> {
    return this.appointments.get(id) || null;
  }

  async findByPetId(petId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.petId === petId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByOwner(ownerId: number): Promise<Appointment[]> {
    const ownerPetIds = Array.from(this.pets.values())
      .filter(pet => pet.ownerId === ownerId)
      .map(pet => pet.id);

    return Array.from(this.appointments.values())
      .filter(appointment => ownerPetIds.includes(appointment.petId))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async create(data: AppointmentCreateData): Promise<Appointment> {
    const appointment = Appointment.create(
      this.nextId++,
      data.petId,
      data.date,
      data.reason,
      data.notes
    );

    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async update(id: number, data: AppointmentUpdateData): Promise<Appointment> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    const updatedAppointment = Appointment.fromDatabase(
      id,
      data.petId ?? existingAppointment.petId,
      data.date ?? existingAppointment.date,
      data.reason ?? existingAppointment.reason,
      data.notes !== undefined ? data.notes : existingAppointment.notes
    );

    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async delete(id: number): Promise<void> {
    if (!this.appointments.has(id)) {
      throw new Error('Appointment not found');
    }
    this.appointments.delete(id);
  }

  async verifyOwnership(appointmentId: number, ownerId: number): Promise<boolean> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      return false;
    }

    const pet = this.pets.get(appointment.petId);
    return pet?.ownerId === ownerId;
  }

  async verifyPetOwnership(petId: number, ownerId: number): Promise<boolean> {
    const pet = this.pets.get(petId);
    return pet?.ownerId === ownerId;
  }
}
