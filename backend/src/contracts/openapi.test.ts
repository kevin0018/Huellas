import { describe, expect, it } from 'vitest';
import { openApiDocument } from './openapi.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const requiredOperations: ReadonlyArray<readonly [string, HttpMethod]> = [
  ['/auth/login', 'post'],
  ['/auth/profile', 'get'],
  ['/pets', 'post'],
  ['/pets/{petId}', 'get'],
  ['/appointments', 'get'],
  ['/appointments', 'post'],
  ['/appointments/{appointmentId}', 'put'],
  ['/pets/{petId}/health-events', 'get'],
  ['/health-events/{eventId}', 'put'],
  ['/pets/{petId}/health-documents', 'post'],
  ['/health-documents/{documentId}', 'get'],
  ['/pets/{petId}/health-shares', 'post'],
  ['/shared-health/{token}', 'get'],
  ['/health-shares/{shareId}', 'delete'],
  ['/reminders', 'get'],
  ['/reminders/preferences', 'patch'],
  ['/reminders/{reminderId}', 'patch'],
];

const requiredSchemas = [
  'ApiError',
  'AuthSession',
  'UserProfile',
  'Pet',
  'Appointment',
  'HealthEvent',
  'HealthDocument',
  'HealthShare',
  'Reminder',
] as const;

describe('core OpenAPI contract', () => {
  it('publishes an OpenAPI 3 contract under the API server prefix', () => {
    expect(openApiDocument.openapi).toMatch(/^3\./);
    expect(openApiDocument.servers).toContainEqual(expect.objectContaining({ url: '/api' }));
    expect(openApiDocument.paths['/openapi.json'].get.responses).toHaveProperty('200');
  });

  it.each(requiredOperations)('documents %s %s', (path, method) => {
    const pathItem = openApiDocument.paths[path as keyof typeof openApiDocument.paths];
    expect(pathItem, `Missing path ${path}`).toBeDefined();
    expect(pathItem).toHaveProperty(method);
  });

  it.each(requiredSchemas)('defines the reusable %s schema', (schema) => {
    expect(openApiDocument.components.schemas).toHaveProperty(schema);
  });

  it('uses unique operation IDs and bearer authentication on private operations', () => {
    const operationIds: string[] = [];
    for (const [path, pathItem] of Object.entries(openApiDocument.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        if (!(method in pathItem)) continue;
        const operation = pathItem[method as keyof typeof pathItem] as { operationId?: string; security?: unknown };
        expect(operation.operationId, `${method.toUpperCase()} ${path} needs an operationId`).toBeTruthy();
        operationIds.push(operation.operationId!);
        if (!['/auth/login', '/openapi.json', '/shared-health/{token}'].includes(path)) {
          expect(operation.security, `${method.toUpperCase()} ${path} must require bearer auth`).toEqual([{ bearerAuth: [] }]);
        }
      }
    }
    expect(new Set(operationIds).size).toBe(operationIds.length);
  });
});
