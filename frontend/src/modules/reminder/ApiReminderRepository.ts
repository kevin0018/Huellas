import { ensureResponseOk, fetchResponse } from '../../shared/api/response';
import { AuthService } from '../auth/infra/AuthService.js';
import { API_BASE_URL } from '../../shared/api/apiConfig.js';

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

const apiUrl = API_BASE_URL;

export class ApiReminderRepository {
  private headers() { return { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' }; }

  async list(): Promise<ReminderFeed> {
    const response = await fetchResponse(`${apiUrl}/reminders`, { headers: this.headers() });
    await ensureResponseOk(response, 'LOAD_REMINDERS');
    return response.json();
  }

  async action(id: number, action: 'postpone' | 'complete' | 'cancel', days?: number): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/reminders/${id}`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify({ action, days }) });
    await ensureResponseOk(response, 'UPDATE_REMINDER');
  }

  async preferences(enabled: boolean, leadDays: number): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/reminders/preferences`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify({ enabled, leadDays }) });
    await ensureResponseOk(response, 'SAVE_REMINDER_PREFERENCES');
  }
}
