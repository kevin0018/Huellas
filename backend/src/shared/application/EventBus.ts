import { DomainEvent } from './DomainEvent.js';
import { DomainEventHandler } from './DomainEventHandler.js';

export class EventBus {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  register<E extends DomainEvent>(eventName: string, handler: DomainEventHandler<E>) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventName = (event.constructor as any).eventName;
    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      await handler.handle(event);
    }
  }
}
