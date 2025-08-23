export class ToggleVolunteerCommand {
  public readonly isBecomingVolunteer: boolean;
  public readonly description?: string;

  constructor(isBecomingVolunteer: boolean, description?: string) {
    this.isBecomingVolunteer = isBecomingVolunteer;
    this.description = description;
  }
}
