import { VolunteerRepository } from "../../domain/repositories/VolunteerRepository.js";
import { Volunteer } from "../../domain/entities/Volunteer.js";
import { VolunteerId } from "../../domain/value-objects/VolunteerId.js";

export class MemoryVolunteerRepository implements VolunteerRepository {
  private volunteers: Map<number, Volunteer> = new Map();

  async findById(id: VolunteerId): Promise<Volunteer | null> {
    return this.volunteers.get(id.getValue()) ?? null;
  }

  async save(volunteer: Volunteer): Promise<number> {
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
    
    const generatedId = this.volunteers.size + 1;
    const volunteerWithGeneratedId = Volunteer.createWithHashedPassword(
      new VolunteerId(generatedId),
      volunteer.name,
      volunteer.lastName,
      volunteer.email,
      volunteer.password,
      volunteer.description
    );
    
    this.volunteers.set(generatedId, volunteerWithGeneratedId);
    return generatedId;
  }

  async delete(id: VolunteerId): Promise<void> {
    this.volunteers.delete(id.getValue());
  }
}