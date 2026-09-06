import { describe, expect, it } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { Ajv } from 'ajv';
import formatsPlugin from 'ajv-formats';
import { openApiDocument } from './openapi.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const requiredOperations: ReadonlyArray<readonly [string, HttpMethod]> = [
  ['/auth/login', 'post'],
  ['/auth/logout', 'post'],
  ['/auth/password', 'put'],
  ['/auth/volunteer', 'post'],
  ['/auth/volunteer', 'delete'],
  ['/auth/profile', 'get'],
  ['/owners/register', 'post'],
  ['/volunteers/register', 'post'],
  ['/owners/my-pets', 'get'],
  ['/pets', 'post'],
  ['/pets/{petId}', 'get'],
  ['/pets/{petId}/procedures', 'get'],
  ['/pets/{petId}/checkup', 'post'],
  ['/checkups/{checkupId}', 'patch'],
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
  'CreatePetRequest',
  'Pet',
  'CreateAppointmentRequest',
  'Appointment',
  'CreateHealthEventRequest',
  'UpdateHealthEventRequest',
  'HealthEvent',
  'HealthDocument',
  'HealthShare',
  'Reminder',
] as const;

const jsonDocument = JSON.parse(JSON.stringify(openApiDocument));

function validatesSchema(schemaName: keyof typeof openApiDocument.components.schemas, value: unknown): boolean {
  const ajv = new Ajv({ allErrors: true, strict: false });
  (formatsPlugin as unknown as (instance: Ajv) => Ajv)(ajv);
  ajv.addFormat('byte', /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
  ajv.addFormat('password', true);
  ajv.addFormat('binary', true);
  const validate = ajv.compile({
    components: jsonDocument.components,
    $ref: `#/components/schemas/${schemaName}`,
  });
  return validate(value);
}

const petResponse = {
  id: 4,
  ownerId: 7,
  name: 'Luna',
  race: null,
  type: 'dog',
  birthDate: '2021-05-03T00:00:00.000Z',
  size: 'medium',
  sex: 'female',
  hasPassport: false,
  microchipCode: null,
  passportNumber: null,
  countryOfOrigin: null,
  notes: null,
  allergies: null,
  activeMedications: null,
  medicalConditions: null,
};

describe('core OpenAPI contract', () => {
  it('publishes an OpenAPI 3 contract under the API server prefix', () => {
    expect(openApiDocument.openapi).toMatch(/^3\./);
    expect(openApiDocument.servers).toContainEqual(expect.objectContaining({ url: '/api' }));
    expect(openApiDocument.paths['/openapi.json'].get.responses).toHaveProperty('200');
  });

  it('is structurally valid OpenAPI, including all references and formats', async () => {
    await expect(SwaggerParser.validate(jsonDocument)).resolves.toBeDefined();
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
        if (!['/auth/login', '/owners/register', '/volunteers/register', '/openapi.json', '/shared-health/{token}'].includes(path)) {
          expect(operation.security, `${method.toUpperCase()} ${path} must require bearer auth`).toEqual([{ bearerAuth: [] }]);
        }
      }
    }
    expect(new Set(operationIds).size).toBe(operationIds.length);
  });

  it('distinguishes persisted pet responses from create payloads', () => {
    expect(validatesSchema('Pet', petResponse)).toBe(true);
    expect(validatesSchema('Pet', { ...petResponse, birthDate: '2021-05-03' })).toBe(false);
    const { ownerId: _ownerId, ...withoutOwner } = petResponse;
    expect(validatesSchema('Pet', withoutOwner)).toBe(false);
  });

  it('rejects status from appointment creation while requiring it in responses', () => {
    const create = { petId: 4, date: '2026-09-01T10:30:00+02:00', reason: 'GENERAL_CHECKUP', notes: null };
    expect(validatesSchema('CreateAppointmentRequest', create)).toBe(true);
    expect(validatesSchema('CreateAppointmentRequest', { ...create, status: 'completed' })).toBe(false);
    expect(validatesSchema('Appointment', { id: 9, ...create })).toBe(false);
    expect(validatesSchema('Appointment', { id: 9, ...create, status: 'scheduled' })).toBe(true);
  });

  it('keeps immutable health-event linkage out of updates', () => {
    const event = { type: 'VACCINATION', occurredAt: '2026-08-19T10:00:00Z', title: 'Rabia', provider: 'Clínica' };
    expect(validatesSchema('CreateHealthEventRequest', { ...event, sourceAppointmentId: 12 })).toBe(true);
    expect(validatesSchema('UpdateHealthEventRequest', event)).toBe(true);
    expect(validatesSchema('UpdateHealthEventRequest', { ...event, sourceAppointmentId: 12 })).toBe(false);
  });

  it('enforces document media types and the enumerated capability contract', () => {
    const document = { healthEventId: 2, fileName: 'vacuna.pdf', mimeType: 'application/pdf', contentBase64: 'JVBERi0=' };
    expect(validatesSchema('HealthDocumentInput', document)).toBe(true);
    expect(validatesSchema('HealthDocumentInput', { ...document, mimeType: 'text/html' })).toBe(false);
    expect(validatesSchema('UserProfile', { id: 1, name: 'Ana', lastName: 'Pérez', email: 'ana@example.com', type: 'owner', roles: ['owner'], capabilities: ['admin'] })).toBe(false);
  });
});
