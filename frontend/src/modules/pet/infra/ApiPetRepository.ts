// src/modules/pet/infra/ApiPetRepository.ts
import { Pet } from '../domain/Pet';
// ⚠️ importa AuthService si existe en tu proyecto:
import { AuthService } from '../../auth/infra/AuthService';

export class ApiPetRepository {
  private readonly baseUrl: string;

  constructor() {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    this.baseUrl = `${apiUrl}/pets`;
  }

  // ---------- helpers ----------
  private readCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  private getAuthHeaders(): HeadersInit {
    // intenta en este orden: AuthService, localStorage, sessionStorage, cookie
    const svc: any = AuthService as any;
    const raw =
      (svc?.getToken?.() as string | undefined) ??
      localStorage.getItem('token') ??
      localStorage.getItem('accessToken') ??
      sessionStorage.getItem('token') ??
      this.readCookie('token') ??
      '';

    if (!raw) return {};
    const header = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { Authorization: header };
  }

  private async doFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let res: Response;
    try {
      res = await fetch(input, {
        ...init,
        credentials: 'include', // por si usas cookies además del header
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
          ...this.getAuthHeaders(),
        },
      });
    } catch (err) {
      throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
    }
    return res;
  }

  private async ensureOk(res: Response) {
    if (!res.ok) {
      // intenta leer el cuerpo de error para mostrar un mensaje útil
      try {
        const data = await res.json();
        if (data?.error) throw new Error(data.error);
      } catch {}
      if (res.status === 401) throw new Error('Unauthorized');
      if (res.status === 403) throw new Error('Forbidden');
      if (res.status >= 500) throw new Error('Server error');
      throw new Error(`HTTP ${res.status}`);
    }
  }

  private toPayload(pet: Pet) {
    return {
      name: pet.name,
      race: pet.race,
      type: pet.type,
      sex: pet.sex,
      size: pet.size,
      birth_date: pet.birthDate ? pet.birthDate.toISOString().slice(0, 10) : null,
      microchip_code: pet.microchipCode,
      has_passport: pet.hasPassport,
      country_of_origin: pet.countryOfOrigin,
      passport_number: pet.passportNumber,
      notes: pet.notes,
    };
  }

  private fromDto(d: any): Pet {
    return Pet.create({
      id: d.id,
      name: d.name,
      race: d.race ?? null,
      type: d.type,
      ownerId: d.ownerId ?? d.owner_id,
      birthDate: d.birthDate ? new Date(d.birthDate) : (d.birth_date ? new Date(d.birth_date) : null),
      size: d.size ?? null,
      microchipCode: d.microchipCode ?? d.microchip_code ?? null,
      sex: d.sex,
      hasPassport: Boolean(d.hasPassport ?? d.has_passport),
      countryOfOrigin: d.countryOfOrigin ?? d.country_of_origin ?? null,
      passportNumber: d.passportNumber ?? d.passport_number ?? null,
      notes: d.notes ?? null,
    });
  }

  // ---------- API ----------
  async register(pet: Pet): Promise<void> {
    const res = await this.doFetch(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(this.toPayload(pet)),
    });
    await this.ensureOk(res);
  }

  async getMine() {
    const res = await this.doFetch(`${this.baseUrl}/mine`, { method: 'GET' });
    await this.ensureOk(res);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((d: any) => this.fromDto(d));
  }

  async getById(id: number) {
    const res = await this.doFetch(`${this.baseUrl}/${id}`, { method: 'GET' });
    if (!res.ok) {
      if (res.status === 404) return null;
      await this.ensureOk(res);
    }
    const data = await res.json();
    return this.fromDto(data);
  }

  async patch(id: number, pet: Partial<Pet>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if ('name' in pet) payload.name = pet.name;
    if ('race' in pet) payload.race = pet.race ?? null;
    if ('type' in pet) payload.type = (pet as any).type;
    if ('sex' in pet) payload.sex = (pet as any).sex;
    if ('size' in pet) payload.size = (pet as any).size;
    if ('birthDate' in pet) {
      const bd = (pet as any).birthDate as Date | null | undefined;
      payload.birth_date = bd ? bd.toISOString().slice(0, 10) : null;
    }
    if ('microchipCode' in pet) payload.microchip_code = (pet as any).microchipCode ?? null;
    if ('hasPassport' in pet) payload.has_passport = !!(pet as any).hasPassport;
    if ('countryOfOrigin' in pet) payload.country_of_origin = (pet as any).countryOfOrigin ?? null;
    if ('passportNumber' in pet) payload.passport_number = (pet as any).passportNumber ?? null;
    if ('notes' in pet) payload.notes = (pet as any).notes ?? null;

    const res = await this.doFetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await this.ensureOk(res);
  }

  async delete(id: number): Promise<void> {
    const res = await this.doFetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    await this.ensureOk(res);
  }
}
