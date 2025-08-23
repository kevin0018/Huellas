export class ChangePasswordCommand {
  public readonly currentPassword: string;
  public readonly newPassword: string;

  constructor(currentPassword: string, newPassword: string) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}
