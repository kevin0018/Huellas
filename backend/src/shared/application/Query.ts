export abstract class Query {
  static readonly queryName: string = 'base_query';
  readonly queryId: string;
  readonly queryTime: Date;

  constructor() {
    this.queryId = crypto.randomUUID();
    this.queryTime = new Date();
  }
}

// Registry for Query classes by name
export class QueryRegistry {
  private static registry: Map<string, any> = new Map();

  static register(queryName: string, queryClass: any) {
    if (this.registry.has(queryName)) {
      throw new Error(`Query ${queryName} already registered.`);
    }
    this.registry.set(queryName, queryClass);
  }

  static get(queryName: string): any {
    return this.registry.get(queryName);
  }
}

// Decorator for registering queries
export function RegisterQuery(queryName: string) {
  return function (target: any) {
    QueryRegistry.register(queryName, target);
    target.queryName = queryName;
  };
}

// Helper to instantiate a query from a primitive object
export function queryFromPrimitive(primitive: Record<string, any>): Query {
  const { queryName, ...args } = primitive;
  const QueryClass = QueryRegistry.get(queryName);
  if (!QueryClass) throw new Error(`Query ${queryName} not found.`);
  return new QueryClass(...Object.values(args));
}
