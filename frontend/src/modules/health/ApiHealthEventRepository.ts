import { AuthService } from '../auth/infra/AuthService.js';
import type { HealthDocument, HealthEvent, HealthEventDraft } from './HealthEvent.js';

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

  async uploadDocument(petId: number, healthEventId: number, file: File): Promise<HealthDocument> {
    const contentBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.readAsDataURL(file);
    });
    return parseResponse(await fetch(`${apiUrl}/pets/${petId}/health-documents`, {
      method: 'POST',
      headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ healthEventId, fileName: file.name, mimeType: file.type, contentBase64 }),
    }));
  }

  async downloadDocument(document: HealthDocument): Promise<void> {
    const response = await fetch(`${apiUrl}/health-documents/${document.id}`, { headers: AuthService.getAuthHeaders() });
    if (!response.ok) throw new Error('No se pudo descargar el documento');
    const url = URL.createObjectURL(await response.blob());
    const anchor = window.document.createElement('a');
    anchor.href = url; anchor.download = document.fileName; anchor.click();
    URL.revokeObjectURL(url);
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await fetch(`${apiUrl}/health-documents/${id}`, { method: 'DELETE', headers: AuthService.getAuthHeaders() });
    if (!response.ok) throw new Error('No se pudo eliminar el documento');
  }
}
