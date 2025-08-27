import type { ProcedureScheduleRepository } from '../domain/ProcedureScheduleRepository';
import { ProcedureSchedule } from '../domain/ProcedureSchedule';

export type AuthHeaderProvider = () => HeadersInit | Promise<HeadersInit>;

export class ApiProcedureScheduleRepository implements ProcedureScheduleRepository {
  private readonly baseUrl: string;
  private readonly getAuthHeaders?: AuthHeaderProvider;

  constructor(opts?: { getAuthHeaders?: AuthHeaderProvider }) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    this.baseUrl = `${apiUrl}/procedure-schedule`;
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
    return (await res.json()) as T;
  }

  async listAll(): Promise<ProcedureSchedule[]> {
    const data = await this.request<any[]>(this.baseUrl, { method: 'GET' });
    return data.map(d => ProcedureSchedule.create({
      id: d.id,
      i18nKey: d.i18nKey,
      i18nTextKey: d.i18nTextKey ?? `${d.i18nKey}text`,
      fromWeeks: d.fromWeeks,
      toWeeks: d.toWeeks ?? null,
    }));
  }
}