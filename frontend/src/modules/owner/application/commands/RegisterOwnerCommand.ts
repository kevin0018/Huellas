export class RegisterOwnerCommand {
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly password: string;

  constructor(
    name: string,
    lastName: string,
    email: string,
    password: string
  ) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }
}
