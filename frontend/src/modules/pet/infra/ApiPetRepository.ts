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

  async getUserPets(): Promise<Pet[]> {
    const response = await fetch(`${this.baseUrl}/owners/my-pets`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch pets: ${response.statusText}`);
    const rawPets = await response.json();
    return rawPets.map((pet: Record<string, unknown>) => this.fromApi(pet));
  }

  // NEW: create pet (ownerId comes from JWT on the backend)
  // inside ApiPetRepository.create

  async create(data: Omit<Pet, 'id' | 'ownerId'>): Promise<Pet> {
    const user = AuthService.getUser?.() as any;
    const ownerId =
      user?.ownerId ?? user?.owner?.id ?? undefined; // attach only if we have it

    const birthISO = data.birthDate
      ? new Date(`${data.birthDate}T00:00:00.000Z`).toISOString()
      : null;

    const body: Record<string, unknown> = {
      name: data.name,
      race: data.race,
      type: data.type,
      birthDate: birthISO,
      size: data.size,
      microchipCode: data.microchipCode,
      sex: data.sex,
      hasPassport: data.hasPassport,
      countryOfOrigin: data.countryOfOrigin?.trim() || null,
      passportNumber: data.passportNumber?.trim() || null,
      notes: data.notes?.trim() || null,
    };

    if (ownerId) body.ownerId = ownerId; // optional, but fixes FK immediately

    const res = await fetch(`${this.baseUrl}/pets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {
        try { msg = await res.text(); } catch {}
      }
      throw new Error(`Failed to create pet: ${msg}`);
    }

    const raw = await res.json();
    return this.fromApi(raw);
  }


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
      countryOfOrigin: (pet.countryOfOrigin as string) ?? (pet.country_of_origin as string) ?? undefined,
      passportNumber: (pet.passportNumber as string) ?? (pet.passport_number as string) ?? undefined,
      notes: (pet.notes as string) ?? undefined,
    };
  }
}