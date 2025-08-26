export class Volunteer {
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly description: string;

  private constructor(name: string, lastName: string, email: string, password: string, description: string) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.description = description;
  }

  /**
   * Factory method to create a new Volunteer with validation.
   */
  static create(props: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    description: string;
  }): Volunteer {
    if (!props.name || !props.lastName || !props.email || !props.password || !props.description) {
      throw new Error('All fields are required');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(props.email)) {
      throw new Error('Invalid email format');
    }
    if (props.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (props.description.length < 10) {
      throw new Error('Description must be at least 10 characters');
    }
    return new Volunteer(
      props.name.trim(),
      props.lastName.trim(),
      props.email.trim().toLowerCase(),
      props.password,
      props.description.trim()
    );
  }

  clone(): Volunteer {
    return new Volunteer(this.name, this.lastName, this.email, this.password, this.description);
  }
}