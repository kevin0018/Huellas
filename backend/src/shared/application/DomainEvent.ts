export abstract class DomainEvent {
  static readonly eventName: string = 'base_domain_event';
  readonly eventId: string;
  readonly eventTime: Date;
  readonly eventTag: string;

  constructor(eventTag: string = '') {
    this.eventId = crypto.randomUUID();
    this.eventTime = new Date();
    this.eventTag = eventTag;
  }
}

// Registry for DomainEvent classes by name
export class DomainEventRegistry {
  private static registry: Map<string, any> = new Map();

  static register(eventName: string, eventClass: any) {
    if (this.registry.has(eventName)) {
      throw new Error(`Event ${eventName} already registered.`);
    }
    this.registry.set(eventName, eventClass);
  }

  static get(eventName: string): any {
    return this.registry.get(eventName);
  }
}

// Decorator for registering events
export function RegisterDomainEvent(eventName: string) {
  return function (target: any) {
    DomainEventRegistry.register(eventName, target);
    target.eventName = eventName;
  };
}

// Helper to instantiate an event from a primitive object
export function domainEventFromPrimitive(primitive: Record<string, any>): DomainEvent {
  const { eventName, eventTag = '', ...args } = primitive;
  const EventClass = DomainEventRegistry.get(eventName);
  if (!EventClass) throw new Error(`Event ${eventName} not found.`);
  return new EventClass(eventTag, ...Object.values(args));
}
