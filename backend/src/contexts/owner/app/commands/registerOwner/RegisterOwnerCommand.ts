import { Command, RegisterCommand } from '../../../../../shared/application/Command.js';
@RegisterCommand('register_owner')
export class RegisterOwnerCommand extends Command {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string
  ) {
    super();
  }
}