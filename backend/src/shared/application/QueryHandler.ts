import { Query } from './Query.js';

export interface QueryHandler<Q extends Query = Query, R = any> {
  handle(query: Q): Promise<R>;
}
