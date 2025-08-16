import { VolunteerRepository } from "../../domain/repositories/VolunteerRepository.js";
import { Volunteer } from "../../domain/entities/Volunteer.js";
import { VolunteerId } from "../../domain/value-objects/VolunteerId.js";

export class MemoryVolunteerRepository implements VolunteerRepository {
  private volunteers: Map<number, Volunteer> = new Map();

  async findById(id: VolunteerId): Promise<Volunteer | null> {
    return this.volunteers.get(id.getValue()) ?? null;
  }

  async save(volunteer: Volunteer): Promise<void> {
    // Check if volunteer with the same ID already exists
    const existingVolunteer = await this.findById(volunteer.id);
    if (existingVolunteer) {
      throw new Error("Volunteer already exists");
    }
    // Verify if email is unique
    for (const existingVolunteer of this.volunteers.values()) {
      if (existingVolunteer.email === volunteer.email) {
        throw new Error("Volunteer with this email already exists");
      }
    }
    this.volunteers.set(volunteer.id.getValue(), volunteer);
  }

  async delete(id: VolunteerId): Promise<void> {
    this.volunteers.delete(id.getValue());
  }
}