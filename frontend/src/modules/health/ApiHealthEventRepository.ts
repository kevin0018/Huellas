import { ClientError } from '../../shared/errors/ClientError';
import { ensureResponseOk, fetchResponse } from '../../shared/api/response';
import { AuthService } from '../auth/infra/AuthService.js';
import type { HealthDocument, HealthEvent, HealthEventDraft } from './HealthEvent.js';
import { API_BASE_URL } from '../../shared/api/apiConfig.js';

const apiUrl = API_BASE_URL;

async function parseResponse<T>(response: Response): Promise<T> {
  await ensureResponseOk(response);
  return response.json() as Promise<T>;
}

export class ApiHealthEventRepository {
  private summaryBody(sections: string[], periodFrom: string, periodTo: string) {
    return { sections, periodFrom: periodFrom || null, periodTo: periodTo ? `${periodTo}T23:59:59.999Z` : null };
  }
  async list(petId: number): Promise<HealthEvent[]> {
    return parseResponse(await fetchResponse(`${apiUrl}/pets/${petId}/health-events`, {
      headers: AuthService.getAuthHeaders(),
    }));
  }

  async create(petId: number, draft: HealthEventDraft): Promise<HealthEvent> {
    return parseResponse(await fetchResponse(`${apiUrl}/pets/${petId}/health-events`, {
      method: 'POST',
      headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    }));
  }

  async update(id: number, draft: HealthEventDraft): Promise<HealthEvent> {
    return parseResponse(await fetchResponse(`${apiUrl}/health-events/${id}`, {
      method: 'PUT',
      headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    }));
  }

  async delete(id: number): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/health-events/${id}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
    });
    await ensureResponseOk(response);
  }

  async uploadDocument(petId: number, healthEventId: number, file: File): Promise<HealthDocument> {
    const contentBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new ClientError('READ_FILE_FAILED'));
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.readAsDataURL(file);
    });
    return parseResponse(await fetchResponse(`${apiUrl}/pets/${petId}/health-documents`, {
      method: 'POST',
      headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ healthEventId, fileName: file.name, mimeType: file.type, contentBase64 }),
    }));
  }

  async downloadDocument(document: HealthDocument): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/health-documents/${document.id}`, { headers: AuthService.getAuthHeaders() });
    await ensureResponseOk(response);
    const url = URL.createObjectURL(await response.blob());
    const anchor = window.document.createElement('a');
    anchor.href = url; anchor.download = document.fileName; anchor.click();
    URL.revokeObjectURL(url);
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/health-documents/${id}`, { method: 'DELETE', headers: AuthService.getAuthHeaders() });
    await ensureResponseOk(response);
  }

  async exportSummary(petId: number, sections: string[], periodFrom: string, periodTo: string): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/pets/${petId}/health-export`, { method: 'POST', headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(this.summaryBody(sections, periodFrom, periodTo)) });
    await ensureResponseOk(response);
    const url = URL.createObjectURL(await response.blob()); const anchor = window.document.createElement('a');
    anchor.href = url; anchor.download = `cartilla-${petId}.html`; anchor.click(); URL.revokeObjectURL(url);
  }

  async createShare(petId: number, sections: string[], periodFrom: string, periodTo: string): Promise<{ id: number; token: string; expiresAt: string }> {
    return parseResponse(await fetchResponse(`${apiUrl}/pets/${petId}/health-shares`, { method: 'POST', headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ...this.summaryBody(sections, periodFrom, periodTo), expiresInHours: 24 }) }));
  }

  async revokeShare(id: number): Promise<void> {
    const response = await fetchResponse(`${apiUrl}/health-shares/${id}`, { method: 'DELETE', headers: AuthService.getAuthHeaders() });
    await ensureResponseOk(response);
  }
}
