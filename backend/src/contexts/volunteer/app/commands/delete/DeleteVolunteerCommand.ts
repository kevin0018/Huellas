export class DeleteVolunteerCommand {
  constructor(
    public readonly volunteerId: number,
    public readonly requestingUserId: number
  ) {}
}
