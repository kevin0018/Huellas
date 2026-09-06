import { ensureResponseOk, fetchResponse } from '../../../shared/api/response';
import type { ProcedureScheduleRepository } from '../domain/ProcedureScheduleRepository';
import { ProcedureSchedule } from '../domain/ProcedureSchedule';
import { API_BASE_URL } from '../../../shared/api/apiConfig';

export type AuthHeaderProvider = () => HeadersInit | Promise<HeadersInit>;

type ApiProcedureSchedule = {
  id: number;
  i18nKey: string;
  i18nTextKey?: string;
  fromWeeks: number;
  toWeeks?: number | null;
};

export class ApiProcedureScheduleRepository implements ProcedureScheduleRepository {
  private readonly baseUrl: string;
  private readonly getAuthHeaders?: AuthHeaderProvider;

  constructor(opts?: { getAuthHeaders?: AuthHeaderProvider }) {
    this.baseUrl = `${API_BASE_URL}/procedure-schedule`;
    this.getAuthHeaders = opts?.getAuthHeaders;
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.getAuthHeaders ? await this.getAuthHeaders() : {}),
      ...(init?.headers || {}),
    };
    const res = await fetchResponse(url, { ...init, headers });
    await ensureResponseOk(res);
    return (await res.json()) as T;
  }

  async listAll(): Promise<ProcedureSchedule[]> {
    const data = await this.request<ApiProcedureSchedule[]>(this.baseUrl, { method: 'GET' });
    return data.map(d => ProcedureSchedule.create({
      id: d.id,
      i18nKey: d.i18nKey,
      i18nTextKey: d.i18nTextKey ?? `${d.i18nKey}text`,
      fromWeeks: d.fromWeeks,
      toWeeks: d.toWeeks ?? null,
    }));
  }
}
