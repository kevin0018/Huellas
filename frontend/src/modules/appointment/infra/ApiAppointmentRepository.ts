import type { AppointmentRepository } from '../domain/AppointmentRepository.js';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../domain/Appointment.js';
import { ApiError, apiClient } from '../../../shared/api/apiClient.js';

export class ApiAppointmentRepository implements AppointmentRepository {
  async getAppointments(): Promise<Appointment[]> {
    try {
      return await apiClient.get<Appointment[]>('/appointments');
    } catch (error) {
      // Preserve compatibility with older API versions that returned 404 for an empty list.
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  }

  async getAppointment(id: number): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  }

  async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', request);
  }

  async updateAppointment(id: number, request: UpdateAppointmentRequest): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}`, request);
  }

  async deleteAppointment(id: number): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }
}
