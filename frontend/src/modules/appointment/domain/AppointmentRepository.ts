import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from './Appointment.js';

export interface AppointmentRepository {
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment>;
  createAppointment(request: CreateAppointmentRequest): Promise<Appointment>;
  updateAppointment(id: number, request: UpdateAppointmentRequest): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}
