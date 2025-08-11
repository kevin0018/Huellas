import { DomainEvent } from './DomainEvent.js';

export interface DomainEventHandler<E extends DomainEvent = DomainEvent> {
  handle(event: E): Promise<void>;
}
