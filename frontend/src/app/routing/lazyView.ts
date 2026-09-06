import { lazy, type ComponentType } from 'react';

export class ViewLoadError extends Error {
  constructor(cause: unknown) {
    super('Unable to load route module', { cause });
    this.name = 'ViewLoadError';
  }
}

/** Mark import failures so recovery reloads the document and its asset URLs. */
export function lazyView(load: () => Promise<{ default: ComponentType }>) {
  return lazy(() => load().catch((cause: unknown) => {
    throw new ViewLoadError(cause);
  }));
}
