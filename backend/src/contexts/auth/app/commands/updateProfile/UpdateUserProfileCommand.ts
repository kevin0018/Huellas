export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly description?: string
  ) {}
}
