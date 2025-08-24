export class UpdateProfileCommand {
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly description?: string;

  constructor(name: string, lastName: string, email: string, description?: string) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.description = description;
  }
}
