import { Volunteer } from "../entities/Volunteer.js";
import { VolunteerId } from "../value-objects/VolunteerId.js";

export interface VolunteerRepository {
  findById(id: VolunteerId): Promise<Volunteer | null>;
  save(volunteer: Volunteer): Promise<void>;
  delete(id: VolunteerId): Promise<void>;
}