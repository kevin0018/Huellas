import { Command } from './Command.js';

export interface CommandHandler<C extends Command = Command> {
  execute(command: C): Promise<void>;
}

// Registry for CommandHandlers by command name
export class CommandHandlerRegistry {
  private static registry: Map<string, any> = new Map();

  static register(commandName: string, handlerClass: any) {
    if (this.registry.has(commandName)) {
      throw new Error(`Handler for command ${commandName} already registered.`);
    }
    this.registry.set(commandName, handlerClass);
  }

  static get(commandName: string): any {
    return this.registry.get(commandName);
  }
}

// Decorator for registering command handlers
export function RegisterCommandHandler(commandName: string) {
  return function (target: any) {
    CommandHandlerRegistry.register(commandName, target);
    target.commandName = commandName;
  };
}
