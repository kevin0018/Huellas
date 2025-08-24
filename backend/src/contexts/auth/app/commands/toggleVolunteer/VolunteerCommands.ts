export class CreateVolunteerProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly description: string
  ) {}
}

export class DeleteVolunteerProfileCommand {
  constructor(public readonly userId: number) {}
}
