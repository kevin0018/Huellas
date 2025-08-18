import { Volunteer } from "../entities/Volunteer.js";
import { VolunteerId } from "../value-objects/VolunteerId.js";

export interface VolunteerRepository {
  findById(id: VolunteerId): Promise<Volunteer | null>;
  save(volunteer: Volunteer): Promise<number>;
  delete(id: VolunteerId): Promise<void>;
}