export enum UserType {
  OWNER = 'owner',
  VOLUNTEER = 'volunteer'
}

export class UserAuth {
  private constructor(
    private readonly _id: number,
    private readonly _name: string,
    private readonly _lastName: string,
    private readonly _email: string,
    private readonly _password: string,
    private readonly _type: UserType
  ) { }

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get lastName(): string {
    return this._lastName;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get type(): UserType {
    return this._type;
  }

  // Factory method for creating instances
  static create(
    id: number,
    name: string,
    lastName: string,
    email: string,
    password: string,
    type: UserType
  ): UserAuth {
    // Domain validations
    UserAuth.validateId(id);
    UserAuth.validateName(name);
    UserAuth.validateLastName(lastName);
    UserAuth.validateEmail(email);
    UserAuth.validatePassword(password);

    return new UserAuth(id, name, lastName, email, password, type);
  }

  // Domain behavior methods
  isOwner(): boolean {
    return this._type === UserType.OWNER;
  }

  isVolunteer(): boolean {
    return this._type === UserType.VOLUNTEER;
  }

  // Validation methods
  private static validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('User ID must be a positive integer');
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  private static validateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
  }

  private static validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format');
    }
  }

  private static validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw new Error('Password is required');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }
}