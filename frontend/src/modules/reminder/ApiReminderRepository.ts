import { AuthService } from '../auth/infra/AuthService.js';

export interface Reminder {
  id: number;
  petId: number;
  petName: string;
  source: 'APPOINTMENT' | 'PREVENTIVE_PLAN';
  title: string;
  dueAt: string;
  status: 'PENDING';
  notifyNow: boolean;
}

export interface ReminderFeed {
  preferences: { enabled: boolean; leadDays: number };
  reminders: Reminder[];
}

const apiUrl = import.meta.env.VITE_API_URL || '/api';

export class ApiReminderRepository {
  private headers() { return { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' }; }

  async list(): Promise<ReminderFeed> {
    const response = await fetch(`${apiUrl}/reminders`, { headers: this.headers() });
    if (!response.ok) throw new Error('No se pudieron cargar los recordatorios');
    return response.json();
  }

  async action(id: number, action: 'postpone' | 'complete' | 'cancel', days?: number): Promise<void> {
    const response = await fetch(`${apiUrl}/reminders/${id}`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify({ action, days }) });
    if (!response.ok) throw new Error('No se pudo actualizar el recordatorio');
  }

  async preferences(enabled: boolean, leadDays: number): Promise<void> {
    const response = await fetch(`${apiUrl}/reminders/preferences`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify({ enabled, leadDays }) });
    if (!response.ok) throw new Error('No se pudieron guardar las preferencias');
  }
}
