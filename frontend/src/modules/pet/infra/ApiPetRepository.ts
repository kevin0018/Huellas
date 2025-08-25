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

    if (!response.ok) {
      throw new Error(`Failed to fetch pets: ${response.statusText}`);
    }

    const rawPets = await response.json();
    
    // Transform backend response to frontend format
    return rawPets.map((pet: Record<string, unknown>) => ({
      id: pet.id as number,
      name: pet.name as string,
      race: pet.race as string,
      type: pet.type as Pet['type'],
      ownerId: pet.ownerId || pet.owner_id as number,
      birthDate: pet.birthDate || pet.birth_date as string,
      size: pet.size as Pet['size'],
      microchipCode: pet.microchipCode || pet.microchip_code as string,
      sex: pet.sex as Pet['sex'],
      hasPassport: pet.hasPassport || pet.has_passport as boolean,
      countryOfOrigin: (pet.countryOfOrigin || pet.country_of_origin as string) || undefined,
      passportNumber: (pet.passportNumber || pet.passport_number as string) || undefined,
      notes: (pet.notes as string) || undefined
    }));
  }
}
