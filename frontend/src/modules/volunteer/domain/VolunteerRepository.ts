import type { Volunteer } from './Volunteer';

export interface VolunteerRepository {
  register(volunteer: Volunteer): Promise<void>;
}
