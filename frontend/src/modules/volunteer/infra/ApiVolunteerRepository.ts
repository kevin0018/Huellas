import { Volunteer } from '../domain/Volunteer';
import type { VolunteerRepository } from '../domain/VolunteerRepository';

export class ApiVolunteerRepository implements VolunteerRepository {
  private readonly baseUrl: string;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    this.baseUrl = `${apiUrl}/volunteers/register`;
  }

  async register(volunteer: Volunteer): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: volunteer.name,
        lastName: volunteer.lastName,
        email: volunteer.email,
        password: volunteer.password,
        description: volunteer.description,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }
  }
}
