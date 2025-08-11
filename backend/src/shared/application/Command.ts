export abstract class Command {
  static readonly commandName: string = 'base_command';
  readonly commandId: string;
  readonly commandTime: Date;
  readonly requiredCommands: string[];

  constructor(requiredCommands: string[] = []) {
    this.commandId = crypto.randomUUID();
    this.commandTime = new Date();
    this.requiredCommands = requiredCommands;
  }
}

// Registry for Command classes by name
export class CommandRegistry {
  private static registry: Map<string, any> = new Map();

  static register(commandName: string, commandClass: any) {
    if (this.registry.has(commandName)) {
      throw new Error(`Command ${commandName} already registered.`);
    }
    this.registry.set(commandName, commandClass);
  }

  static get(commandName: string): any {
    return this.registry.get(commandName);
  }
}

// Decorator for registering commands
export function RegisterCommand(commandName: string) {
  return function (target: any) {
    CommandRegistry.register(commandName, target);
    target.commandName = commandName;
  };
}

// Helper to instantiate a command from a primitive object
export function commandFromPrimitive(primitive: Record<string, any>): Command {
  const { commandName, ...args } = primitive;
  const CommandClass = CommandRegistry.get(commandName);
  if (!CommandClass) throw new Error(`Command ${commandName} not found.`);
  return new CommandClass(...Object.values(args));
}
