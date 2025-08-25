import { Volunteer } from '../domain/Volunteer';
import type { VolunteerRepository } from '../domain/VolunteerRepository';

export class MemoryVolunteerRepository implements VolunteerRepository {
  private volunteers: Volunteer[] = [];

  async register(volunteer: Volunteer): Promise<void> {
    this.volunteers.push(volunteer.clone());
  }

  getAll(): Volunteer[] {
    return this.volunteers.map(v => v.clone());
  }

  clear(): void {
    this.volunteers = [];
  }
}