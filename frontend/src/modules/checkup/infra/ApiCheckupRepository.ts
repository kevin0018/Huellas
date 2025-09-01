import type { CheckupRepository } from '../domain/CheckupRepository';
import { Checkup } from '../domain/Checkup';
import { AuthService } from '../../auth/infra/AuthService.js';

export type AuthHeaderProvider = () => HeadersInit | Promise<HeadersInit>;

export class ApiCheckupRepository implements CheckupRepository {
  private readonly baseUrl: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.baseUrl = `${this.apiUrl}/checkups`;
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const token = AuthService.getToken();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const res = await fetch(url, { ...init, headers });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
  }

  async listByPet(petId: number): Promise<Checkup[]> {
    const data = await this.request<any[]>(`${this.baseUrl}?petId=${petId}`, { method: 'GET' });
    return data.map(d => Checkup.create({ ...d, date: new Date(d.date) }));
  }

  async findLatestByPetAndProcedure(petId: number, procedureId: number): Promise<Checkup | null> {
    const data = await this.request<any[]>(
      `${this.baseUrl}?petId=${petId}&procedureId=${procedureId}&_sort=date&_order=desc&_limit=1`,
      { method: 'GET' }
    ).catch(() => null);
    if (!data || !data.length) return null;
    return Checkup.create({ ...data[0], date: new Date(data[0].date) });
  }

  async create(petId: number, checkupData: { procedureId: number, date?: string, notes?: string }): Promise<Checkup> {
    const body = JSON.stringify({
      procedureId: checkupData.procedureId,
      date: checkupData.date ? new Date(checkupData.date).toISOString().slice(0, 10) : null,// YYYY-MM-DD (matches your DB type)
      notes: checkupData.notes
    });

    const data = await this.request<any>(`${this.apiUrl}/pets/${petId}/checkup`, { method: 'POST', body });

    return Checkup.create({ ...data, date: new Date(data.date) });
  }

  async update(checkupId: number, checkupData: { petId: number; date?: string; notes?: string; }): Promise<Checkup> {
    const body = JSON.stringify({
      checkupId: checkupId,
      petId: checkupData.petId,
      date: checkupData.date ? new Date(checkupData.date).toISOString().slice(0, 10) : null,// YYYY-MM-DD (matches your DB type)
      notes: checkupData.notes
    });

    const data = await this.request<any>(`${this.apiUrl}/checkups/${checkupId}`, { method: 'PATCH', body });

    return Checkup.create({ ...data, date: new Date(data.date) });

  }

  async delete(id: number): Promise<void> {
    await this.request<void>(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }
}