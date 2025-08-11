import { Command } from './Command.js';
import { CommandHandler } from './CommandHandler.js';

export class CommandBus {
  private handlers: Map<string, CommandHandler<any>> = new Map();

  register<C extends Command>(commandName: string, handler: CommandHandler<C>) {
    this.handlers.set(commandName, handler);
  }

  async dispatch(command: Command): Promise<void> {
    const commandName = (command.constructor as any).commandName;
    const handler = this.handlers.get(commandName);
    if (!handler) throw new Error(`No handler for command: ${commandName}`);
    await handler.execute(command);
  }

}
