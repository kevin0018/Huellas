export class UpdateProfileCommand {
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;

  constructor(name: string, lastName: string, email: string) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
  }
}
