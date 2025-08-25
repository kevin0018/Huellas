import { Appointment, AppointmentReason } from '../entities/Appointment.js';

export interface AppointmentCreateData {
  petId: number;
  date: Date;
  reason: AppointmentReason;
  notes?: string;
}

export interface AppointmentUpdateData {
  petId?: number;
  date?: Date;
  reason?: AppointmentReason;
  notes?: string;
}

export interface AppointmentRepository {
  findById(id: number): Promise<Appointment | null>;
  findByPetId(petId: number): Promise<Appointment[]>;
  findByOwner(ownerId: number): Promise<Appointment[]>;
  create(appointment: AppointmentCreateData): Promise<Appointment>;
  update(id: number, appointment: AppointmentUpdateData): Promise<Appointment>;
  delete(id: number): Promise<void>;
  verifyOwnership(appointmentId: number, ownerId: number): Promise<boolean>;
  verifyPetOwnership(petId: number, ownerId: number): Promise<boolean>;
}
