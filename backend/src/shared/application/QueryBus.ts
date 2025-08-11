import { Query } from './Query.js';
import { QueryHandler } from './QueryHandler.js';

export class QueryBus {
  private handlers: Map<string, QueryHandler<any, any>> = new Map();

  register<Q extends Query, R>(queryName: string, handler: QueryHandler<Q, R>) {
    this.handlers.set(queryName, handler);
  }

  async handle<Q extends Query, R>(query: Q): Promise<R> {
    const queryName = (query.constructor as any).queryName;
    const handler = this.handlers.get(queryName);
    if (!handler) throw new Error(`No handler for query: ${queryName}`);
    return handler.handle(query);
  }

}
