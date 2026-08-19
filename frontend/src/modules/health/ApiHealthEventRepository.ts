import { AuthService } from '../auth/infra/AuthService.js';
import type { HealthEvent, HealthEventDraft } from './HealthEvent.js';

const apiUrl = import.meta.env.VITE_API_URL || '/api';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export class ApiHealthEventRepository {
  async list(petId: number): Promise<HealthEvent[]> {
    return parseResponse(await fetch(`${apiUrl}/pets/${petId}/health-events`, {
      headers: AuthService.getAuthHeaders(),
    }));
  }

  async create(petId: number, draft: HealthEventDraft): Promise<HealthEvent> {
    return parseResponse(await fetch(`${apiUrl}/pets/${petId}/health-events`, {
      method: 'POST',
      headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    }));
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${apiUrl}/health-events/${id}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('No se pudo eliminar el evento');
  }
}
