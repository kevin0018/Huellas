import type { AppointmentRepository } from '../domain/AppointmentRepository.js';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../domain/Appointment.js';
import { AuthService } from '../../auth/infra/AuthService.js';

export class ApiAppointmentRepository implements AppointmentRepository {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  private getAuthHeaders(): Record<string, string> {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Some backends 404 when the list is empty; treat it as no data.
        return [];
      }
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }

    return response.json();
  }


  async getAppointment(id: number): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointment: ${response.statusText}`);
    }

    return response.json();
  }

  async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create appointment: ${response.statusText}`);
    }

    return response.json();
  }

  async updateAppointment(id: number, request: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update appointment: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteAppointment(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete appointment: ${response.statusText}`);
    }
  }

  
}
