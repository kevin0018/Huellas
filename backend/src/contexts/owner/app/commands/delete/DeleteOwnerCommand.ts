export class DeleteOwnerCommand {
  constructor(
    public readonly ownerId: number,
    public readonly requestingUserId: number
  ) {}
}
