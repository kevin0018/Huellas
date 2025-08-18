export class RegisterVolunteerCommand {
  constructor(
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly description: string
  ) {}
}
