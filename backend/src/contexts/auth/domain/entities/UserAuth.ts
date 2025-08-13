export enum UserType {
  OWNER = 'owner',
  VOLUNTEER = 'volunteer'
}

export class UserAuth {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly type: UserType
  ) {}

  isOwner(): boolean {
    return this.type === UserType.OWNER;
  }

  isVolunteer(): boolean {
    return this.type === UserType.VOLUNTEER;
  }
}
