// frontend/src/modules/pet/infra/ApiPetRepository.ts
import type { PetRepository } from '../domain/PetRepository.js';
import type { Pet } from '../domain/Pet.js';
import { AuthService } from '../../auth/infra/AuthService.js';

export class ApiPetRepository implements PetRepository {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  private getAuthHeaders(): Record<string, string> {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // -------------------------------------------------------------------------
  // Mappers / error helpers
  // -------------------------------------------------------------------------

  private fromApi(pet: Record<string, unknown>): Pet {
    return {
      id: pet.id as number,
      name: pet.name as string,
      race: pet.race as string,
      type: pet.type as Pet['type'],
      ownerId: (pet.ownerId as number) ?? (pet.owner_id as number),
      birthDate: (pet.birthDate as string) ?? (pet.birth_date as string),
      size: pet.size as Pet['size'],
      microchipCode: (pet.microchipCode as string) ?? (pet.microchip_code as string),
      sex: pet.sex as Pet['sex'],
      hasPassport: (pet.hasPassport as boolean) ?? (pet.has_passport as boolean),
      countryOfOrigin:
        (pet.countryOfOrigin as string) ??
        (pet.country_of_origin as string) ??
        undefined,
      passportNumber:
        (pet.passportNumber as string) ??
        (pet.passport_number as string) ??
        undefined,
      notes: (pet.notes as string) ?? undefined,
    };
  }

  private async ensureOk(res: Response, fallbackMsg: string): Promise<void> {
    if (res.ok) return;
    try {
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
    } catch {
      try {
        const txt = await res.text();
        if (txt) throw new Error(txt);
      } catch {}
    }
    throw new Error(`${fallbackMsg}: ${res.status} ${res.statusText}`);
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /** List pets for the authenticated owner (GET /owners/my-pets) */
  async getUserPets(): Promise<Pet[]> {
    const response = await fetch(`${this.baseUrl}/owners/my-pets`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    await this.ensureOk(response, 'Failed to fetch pets');
    const rawPets = await response.json();
    return (rawPets as Record<string, unknown>[]).map((p) => this.fromApi(p));
  }

  /** Get a single pet (GET /pets/:id) */
  async getPetById(id: number): Promise<Pet> {
    const res = await fetch(`${this.baseUrl}/pets/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    await this.ensureOk(res, 'Failed to fetch pet');
    const raw = await res.json();
    return this.fromApi(raw);
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create pet (POST /pets)
   * ownerId is derived from JWT on the backend, but we’ll include it if present
   * to help FK resolution in some setups.
   */
  async create(data: Omit<Pet, 'id' | 'ownerId'>): Promise<Pet> {
    const user = AuthService.getUser?.() as any;
    const ownerId = user?.ownerId ?? user?.owner?.id ?? undefined;

    // Normalize birthDate -> ISO (midnight) if provided as YYYY-MM-DD
    const birthISO = data.birthDate
      ? new Date(`${data.birthDate}T00:00:00.000Z`).toISOString()
      : null;

    const body: Record<string, unknown> = {
      name: data.name,
      race: data.race,
      type: data.type,
      birthDate: birthISO, // backend accepts Date/ISO; prisma will handle it
      size: data.size,
      microchipCode: data.microchipCode,
      sex: data.sex,
      hasPassport: data.hasPassport,
      countryOfOrigin: data.countryOfOrigin?.trim() || null,
      passportNumber: data.passportNumber?.trim() || null,
      notes: data.notes?.trim() || null,
    };

    if (ownerId) body.ownerId = ownerId;

    const res = await fetch(`${this.baseUrl}/pets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    await this.ensureOk(res, 'Failed to create pet');
    const raw = await res.json();
    return this.fromApi(raw);
  }

  /**
   * Update pet (PATCH /pets/:id)
   * Backend supports updating: name, race, birthDate, size, sex,
   * hasPassport, countryOfOrigin, passportNumber, notes
   */
  async update(
    id: number,
    data: Partial<Pick<
      Pet,
      | 'name'
      | 'race'
      | 'birthDate'
      | 'size'
      | 'sex'
      | 'hasPassport'
      | 'countryOfOrigin'
      | 'passportNumber'
      | 'notes'
    >>
  ): Promise<Pet> {
    const body: Record<string, unknown> = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.race !== undefined && { race: data.race }),
      ...(data.birthDate !== undefined && {
        birthDate: data.birthDate
          ? new Date(`${data.birthDate}T00:00:00.000Z`).toISOString()
          : null,
      }),
      ...(data.size !== undefined && { size: data.size }),
      ...(data.sex !== undefined && { sex: data.sex }),
      ...(data.hasPassport !== undefined && { hasPassport: data.hasPassport }),
      ...(data.countryOfOrigin !== undefined && {
        countryOfOrigin: data.countryOfOrigin?.trim() || null,
      }),
      ...(data.passportNumber !== undefined && {
        passportNumber: data.passportNumber?.trim() || null,
      }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
    };

    const res = await fetch(`${this.baseUrl}/pets/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    await this.ensureOk(res, 'Failed to update pet');
    const raw = await res.json();
    return this.fromApi(raw);
  }

  /** Delete pet (DELETE /pets/:id) */
  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/pets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.ensureOk(res, 'Failed to delete pet');
  }
}