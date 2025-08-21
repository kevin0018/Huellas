export class RegisterVolunteerCommand {
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly password: string;
  public readonly description: string;

  constructor(
    name: string,
    lastName: string,
    email: string,
    password: string,
    description: string
  ) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.description = description;
  }
}
