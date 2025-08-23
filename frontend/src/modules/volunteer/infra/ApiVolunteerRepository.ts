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
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      } catch {
        // If JSON parsing fails, we can't read text anymore because stream is consumed
        // Just throw a generic error based on status code
        if (response.status === 409) {
          throw new Error('Volunteer with this email already exists');
        } else if (response.status >= 500) {
          throw new Error('Server error');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }
    }
  }
}
