import type { CheckupRepository } from '../domain/CheckupRepository';
import { Checkup } from '../domain/Checkup';

export type AuthHeaderProvider = () => HeadersInit | Promise<HeadersInit>;

export class ApiCheckupRepository implements CheckupRepository {
  private readonly baseUrl: string;
  private readonly getAuthHeaders?: AuthHeaderProvider;

  constructor(opts?: { getAuthHeaders?: AuthHeaderProvider }) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    this.baseUrl = `${apiUrl}/checkups`;
    this.getAuthHeaders = opts?.getAuthHeaders;
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.getAuthHeaders ? await this.getAuthHeaders() : {}),
      ...(init?.headers || {}),
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

  async create(ch: Checkup): Promise<Checkup> {
    const body = JSON.stringify({
      petId: ch.petId,
      procedureId: ch.procedureId,
      date: ch.date.toISOString().slice(0, 10), // YYYY-MM-DD (matches your DB type)
      notes: ch.notes ?? null,
    });
    const data = await this.request<any>(this.baseUrl, { method: 'POST', body });
    return Checkup.create({ ...data, date: new Date(data.date) });
  }

  async delete(id: number): Promise<void> {
    await this.request<void>(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }
}