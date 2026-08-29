const bearerSecurity = [{ bearerAuth: [] }];

const jsonBody = (schema: object, required = true) => ({
  required,
  content: { 'application/json': { schema } },
});

const jsonResponse = (description: string, schema?: object) => ({
  description,
  ...(schema ? { content: { 'application/json': { schema } } } : {}),
});

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: 'array', items: ref(name) });
const idParameter = (name: string) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
});

/**
 * Public HTTP contract for Huellas' core API.
 *
 * It deliberately stays as plain data so the deployed service does not need a
 * documentation runtime. Contract tests below protect the paths and reusable
 * schemas that clients depend on.
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Huellas API',
    version: '0.1.0',
    description: 'API for pet identity, appointments and longitudinal health records.',
  },
  servers: [{ url: '/api', description: 'Current server' }],
  tags: [
    { name: 'Identity' },
    { name: 'Pets' },
    { name: 'Appointments' },
    { name: 'Health' },
    { name: 'Reminders' },
  ],
  paths: {
    '/openapi.json': {
      get: {
        summary: 'Download this OpenAPI contract',
        operationId: 'getOpenApiContract',
        responses: { '200': jsonResponse('OpenAPI document') },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Identity'],
        summary: 'Authenticate with email and password',
        operationId: 'login',
        requestBody: jsonBody(ref('LoginRequest')),
        responses: {
          '200': jsonResponse('Authenticated session', ref('AuthSession')),
          '400': jsonResponse('Invalid request', ref('ApiError')),
          '401': jsonResponse('Invalid credentials', ref('ApiError')),
        },
      },
    },
    '/owners/register': {
      post: {
        tags: ['Identity'], summary: 'Register an owner account', operationId: 'registerOwner',
        requestBody: jsonBody(ref('RegisterOwnerRequest')),
        responses: { '201': jsonResponse('Owner registered', ref('RegistrationResponse')), '400': jsonResponse('Invalid registration', ref('ApiError')), '409': jsonResponse('Email already exists', ref('ApiError')) },
      },
    },
    '/volunteers/register': {
      post: {
        tags: ['Identity'], summary: 'Register a volunteer account', operationId: 'registerVolunteer',
        requestBody: jsonBody(ref('RegisterVolunteerRequest')),
        responses: { '201': jsonResponse('Volunteer registered', ref('VolunteerRegistrationResponse')), '400': jsonResponse('Invalid registration', ref('ApiError')) },
      },
    },
    '/owners/my-pets': {
      get: {
        tags: ['Pets'], summary: 'List pets owned by the current user', operationId: 'listOwnedPets', security: bearerSecurity,
        responses: { '200': jsonResponse('Owned pets', arrayOf('Pet')), '401': jsonResponse('Unauthenticated', ref('ApiError')), '403': jsonResponse('Owner capability required', ref('ApiError')) },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Identity'], summary: 'Revoke the current token', operationId: 'logout', security: bearerSecurity,
        responses: { '200': jsonResponse('Session closed', ref('MessageResponse')), '401': jsonResponse('Unauthenticated', ref('ApiError')) },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Identity'], summary: 'Get the current profile', operationId: 'getProfile', security: bearerSecurity,
        responses: { '200': jsonResponse('Current profile', ref('ProfileResponse')), '401': jsonResponse('Unauthenticated', ref('ApiError')) },
      },
      put: {
        tags: ['Identity'], summary: 'Update the current profile', operationId: 'updateProfile', security: bearerSecurity,
        requestBody: jsonBody(ref('UpdateProfileRequest')),
        responses: { '200': jsonResponse('Updated profile', ref('ProfileResponse')), '400': jsonResponse('Invalid profile', ref('ApiError')), '409': jsonResponse('Email already exists', ref('ApiError')) },
      },
    },
    '/auth/password': {
      put: {
        tags: ['Identity'], summary: 'Change the current password', operationId: 'changePassword', security: bearerSecurity,
        requestBody: jsonBody(ref('ChangePasswordRequest')),
        responses: { '200': jsonResponse('Password changed', ref('MessageResponse')), '400': jsonResponse('Invalid password', ref('ApiError')), '401': jsonResponse('Current password is incorrect', ref('ApiError')) },
      },
    },
    '/auth/volunteer': {
      post: {
        tags: ['Identity'], summary: 'Add a volunteer profile to the current identity', operationId: 'createVolunteerProfile', security: bearerSecurity,
        requestBody: jsonBody(ref('CreateVolunteerProfileRequest')),
        responses: { '201': jsonResponse('Volunteer profile created', ref('ProfileResponse')), '400': jsonResponse('Invalid profile', ref('ApiError')), '409': jsonResponse('Volunteer profile already exists', ref('ApiError')) },
      },
      delete: {
        tags: ['Identity'], summary: 'Remove the current volunteer profile', operationId: 'deleteVolunteerProfile', security: bearerSecurity,
        responses: { '200': jsonResponse('Volunteer profile removed', ref('ProfileResponse')), '404': jsonResponse('Volunteer profile not found', ref('ApiError')) },
      },
    },
    '/pets': {
      post: {
        tags: ['Pets'], summary: 'Register a pet', operationId: 'createPet', security: bearerSecurity,
        requestBody: jsonBody(ref('CreatePetRequest')),
        responses: { '201': jsonResponse('Pet registered', ref('Pet')), '400': jsonResponse('Invalid pet', ref('ApiError')), '403': jsonResponse('Owner capability required', ref('ApiError')) },
      },
    },
    '/pets/{petId}': {
      parameters: [idParameter('petId')],
      get: {
        tags: ['Pets'], summary: 'Get an owned pet', operationId: 'getPet', security: bearerSecurity,
        responses: { '200': jsonResponse('Pet', ref('Pet')), '404': jsonResponse('Pet not found', ref('ApiError')) },
      },
      patch: {
        tags: ['Pets'], summary: 'Update an owned pet', operationId: 'updatePet', security: bearerSecurity,
        requestBody: jsonBody(ref('PetUpdateInput')),
        responses: { '200': jsonResponse('Updated pet', ref('Pet')), '400': jsonResponse('Invalid pet', ref('ApiError')), '404': jsonResponse('Pet not found', ref('ApiError')) },
      },
      delete: {
        tags: ['Pets'], summary: 'Delete an owned pet', operationId: 'deletePet', security: bearerSecurity,
        responses: { '204': jsonResponse('Pet deleted'), '404': jsonResponse('Pet not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/procedures': {
      parameters: [idParameter('petId')],
      get: {
        tags: ['Health'], summary: 'Get the preventive plan for an owned pet', operationId: 'getPetProcedures', security: bearerSecurity,
        responses: { '200': jsonResponse('Preventive plan', arrayOf('PetProcedure')), '400': jsonResponse('Plan could not be calculated', ref('ApiError')), '404': jsonResponse('Pet not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/checkup': {
      parameters: [idParameter('petId')],
      post: {
        tags: ['Health'], summary: 'Record a legacy preventive checkup', operationId: 'createCheckup', security: bearerSecurity,
        requestBody: jsonBody(ref('CreateCheckupRequest')),
        responses: { '201': jsonResponse('Checkup created', ref('Checkup')), '400': jsonResponse('Invalid checkup', ref('ApiError')), '404': jsonResponse('Pet or procedure not found', ref('ApiError')) },
      },
    },
    '/checkups/{checkupId}': {
      parameters: [idParameter('checkupId')],
      patch: {
        tags: ['Health'], summary: 'Update an owned legacy checkup', operationId: 'updateCheckup', security: bearerSecurity,
        requestBody: jsonBody(ref('UpdateCheckupRequest')),
        responses: { '200': jsonResponse('Checkup updated', ref('Checkup')), '400': jsonResponse('Invalid checkup', ref('ApiError')), '404': jsonResponse('Checkup or procedure not found', ref('ApiError')) },
      },
      delete: {
        tags: ['Health'], summary: 'Delete an owned legacy checkup', operationId: 'deleteCheckup', security: bearerSecurity,
        responses: { '204': jsonResponse('Checkup deleted'), '404': jsonResponse('Checkup not found', ref('ApiError')) },
      },
    },
    '/appointments': {
      get: {
        tags: ['Appointments'], summary: 'List the owner appointments', operationId: 'listAppointments', security: bearerSecurity,
        responses: { '200': jsonResponse('Appointments', arrayOf('Appointment')), '403': jsonResponse('Owner capability required', ref('ApiError')) },
      },
      post: {
        tags: ['Appointments'], summary: 'Schedule an appointment', operationId: 'createAppointment', security: bearerSecurity,
        requestBody: jsonBody(ref('CreateAppointmentRequest')),
        responses: { '201': jsonResponse('Appointment created', ref('Appointment')), '400': jsonResponse('Invalid appointment', ref('ApiError')) },
      },
    },
    '/appointments/{appointmentId}': {
      parameters: [idParameter('appointmentId')],
      get: {
        tags: ['Appointments'], summary: 'Get an appointment', operationId: 'getAppointment', security: bearerSecurity,
        responses: { '200': jsonResponse('Appointment', ref('Appointment')), '404': jsonResponse('Appointment not found', ref('ApiError')) },
      },
      put: {
        tags: ['Appointments'], summary: 'Replace an appointment', operationId: 'updateAppointment', security: bearerSecurity,
        requestBody: jsonBody(ref('AppointmentUpdateInput')),
        responses: { '200': jsonResponse('Updated appointment', ref('Appointment')), '400': jsonResponse('Invalid appointment', ref('ApiError')), '404': jsonResponse('Appointment not found', ref('ApiError')) },
      },
      delete: {
        tags: ['Appointments'], summary: 'Cancel an appointment', operationId: 'deleteAppointment', security: bearerSecurity,
        responses: { '204': jsonResponse('Appointment deleted'), '404': jsonResponse('Appointment not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/health-events': {
      parameters: [idParameter('petId')],
      get: {
        tags: ['Health'], summary: 'List a pet health timeline', operationId: 'listHealthEvents', security: bearerSecurity,
        responses: { '200': jsonResponse('Health events newest first', arrayOf('HealthEvent')) },
      },
      post: {
        tags: ['Health'], summary: 'Add a health event', operationId: 'createHealthEvent', security: bearerSecurity,
        requestBody: jsonBody(ref('CreateHealthEventRequest')),
        responses: { '201': jsonResponse('Health event created', ref('HealthEvent')), '400': jsonResponse('Invalid health event', ref('ApiError')) },
      },
    },
    '/health-events/{eventId}': {
      parameters: [idParameter('eventId')],
      put: {
        tags: ['Health'], summary: 'Replace a health event', operationId: 'updateHealthEvent', security: bearerSecurity,
        requestBody: jsonBody(ref('UpdateHealthEventRequest')),
        responses: { '200': jsonResponse('Updated event', ref('HealthEvent')), '400': jsonResponse('Invalid event', ref('ApiError')), '404': jsonResponse('Event not found', ref('ApiError')) },
      },
      delete: {
        tags: ['Health'], summary: 'Delete a health event', operationId: 'deleteHealthEvent', security: bearerSecurity,
        responses: { '204': jsonResponse('Event deleted'), '404': jsonResponse('Event not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/health-documents': {
      parameters: [idParameter('petId')],
      post: {
        tags: ['Health'], summary: 'Attach a private health document', operationId: 'createHealthDocument', security: bearerSecurity,
        requestBody: jsonBody(ref('HealthDocumentInput')),
        responses: { '201': jsonResponse('Document stored', ref('HealthDocument')), '400': jsonResponse('Invalid document', ref('ApiError')) },
      },
    },
    '/health-documents/{documentId}': {
      parameters: [idParameter('documentId')],
      get: {
        tags: ['Health'], summary: 'Download a private health document', operationId: 'downloadHealthDocument', security: bearerSecurity,
        responses: { '200': { description: 'Original document bytes', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } }, 'image/jpeg': { schema: { type: 'string', format: 'binary' } }, 'image/png': { schema: { type: 'string', format: 'binary' } }, 'image/webp': { schema: { type: 'string', format: 'binary' } } } }, '404': jsonResponse('Document not found', ref('ApiError')) },
      },
      delete: {
        tags: ['Health'], summary: 'Delete a health document', operationId: 'deleteHealthDocument', security: bearerSecurity,
        responses: { '204': jsonResponse('Document deleted'), '404': jsonResponse('Document not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/health-export': {
      parameters: [idParameter('petId')],
      post: {
        tags: ['Health'], summary: 'Export a pet health summary', operationId: 'exportPetHealth', security: bearerSecurity,
        requestBody: jsonBody(ref('HealthSummaryOptions'), false),
        responses: { '200': { description: 'Health summary document', content: { 'text/html': { schema: { type: 'string' } } } }, '404': jsonResponse('Pet not found', ref('ApiError')) },
      },
    },
    '/pets/{petId}/health-shares': {
      parameters: [idParameter('petId')],
      get: {
        tags: ['Health'], summary: 'List active and revoked shares', operationId: 'listHealthShares', security: bearerSecurity,
        responses: { '200': jsonResponse('Health shares', arrayOf('HealthShare')) },
      },
      post: {
        tags: ['Health'], summary: 'Create an expiring read-only share', operationId: 'createHealthShare', security: bearerSecurity,
        requestBody: jsonBody(ref('CreateHealthShareRequest'), false),
        responses: { '201': jsonResponse('Share created; the raw token is returned only once', ref('CreatedHealthShare')), '400': jsonResponse('Invalid expiry', ref('ApiError')) },
      },
    },
    '/health-shares/{shareId}': {
      parameters: [idParameter('shareId')],
      delete: {
        tags: ['Health'], summary: 'Revoke a health share', operationId: 'revokeHealthShare', security: bearerSecurity,
        responses: { '204': jsonResponse('Share revoked'), '404': jsonResponse('Share not found', ref('ApiError')) },
      },
    },
    '/shared-health/{token}': {
      parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string', minLength: 32 } }],
      get: {
        tags: ['Health'], summary: 'Read a shared health summary', operationId: 'getSharedHealth',
        responses: {
          '200': { description: 'Shared read-only health summary', content: { 'text/html': { schema: { type: 'string' } } } },
          '404': { description: 'Invalid, expired or revoked share', content: { 'text/plain': { schema: { type: 'string' } } } },
        },
      },
    },
    '/reminders': {
      get: {
        tags: ['Reminders'], summary: 'List actionable reminders', operationId: 'listReminders', security: bearerSecurity,
        responses: { '200': jsonResponse('Reminder inbox and preferences', ref('ReminderInbox')) },
      },
    },
    '/reminders/preferences': {
      patch: {
        tags: ['Reminders'], summary: 'Update reminder preferences', operationId: 'updateReminderPreferences', security: bearerSecurity,
        requestBody: jsonBody(ref('ReminderPreferences')),
        responses: { '200': jsonResponse('Updated preferences', ref('ReminderPreferences')), '400': jsonResponse('Invalid preferences', ref('ApiError')) },
      },
    },
    '/reminders/{reminderId}': {
      parameters: [idParameter('reminderId')],
      patch: {
        tags: ['Reminders'], summary: 'Complete, postpone or cancel a reminder', operationId: 'actOnReminder', security: bearerSecurity,
        requestBody: jsonBody(ref('ReminderAction')),
        responses: { '204': jsonResponse('Reminder updated'), '400': jsonResponse('Invalid action', ref('ApiError')), '404': jsonResponse('Reminder not found', ref('ApiError')) },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiError: { type: 'object', required: ['error'], properties: { error: { type: 'string' } } },
      MessageResponse: { type: 'object', additionalProperties: false, required: ['message'], properties: { message: { type: 'string' } } },
      LoginRequest: { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
      AuthSession: { type: 'object', required: ['token', 'user'], properties: { token: { type: 'string' }, user: ref('UserProfile') } },
      ProfileResponse: { type: 'object', required: ['user'], properties: { message: { type: 'string' }, user: ref('UserProfile') } },
      UserProfile: {
        type: 'object', required: ['id', 'name', 'lastName', 'email', 'type', 'roles', 'capabilities'],
        properties: {
          id: { type: 'integer' }, name: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string', format: 'email' }, type: { type: 'string', enum: ['owner', 'volunteer'], description: 'Legacy primary profile; use roles and capabilities for authorization.' }, description: { type: 'string', nullable: true },
          roles: { type: 'array', uniqueItems: true, items: { type: 'string', enum: ['owner', 'volunteer'] } },
          capabilities: { type: 'array', uniqueItems: true, items: { type: 'string', enum: ['manage:pets', 'manage:health', 'manage:appointments', 'publish:volunteer-posts', 'use:chat'] } },
        },
      },
      RegisterOwnerRequest: { type: 'object', additionalProperties: false, required: ['name', 'lastName', 'email', 'password'], properties: { name: { type: 'string', minLength: 1 }, lastName: { type: 'string', minLength: 1 }, email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
      RegistrationResponse: { type: 'object', additionalProperties: false, required: ['message', 'data'], properties: { message: { type: 'string' }, data: { type: 'object', additionalProperties: false, required: ['id', 'name', 'lastName', 'email'], properties: { id: { type: 'integer' }, name: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string', format: 'email' } } } } },
      RegisterVolunteerRequest: { type: 'object', additionalProperties: false, required: ['name', 'lastName', 'email', 'password', 'description'], properties: { name: { type: 'string', minLength: 1 }, lastName: { type: 'string', minLength: 1 }, email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' }, description: { type: 'string', minLength: 1 } } },
      VolunteerRegistrationResponse: { type: 'object', additionalProperties: false, required: ['success', 'data'], properties: { success: { type: 'boolean', enum: [true] }, data: { type: 'object', additionalProperties: false, required: ['id', 'message'], properties: { id: { type: 'integer' }, message: { type: 'string' } } } } },
      UpdateProfileRequest: { type: 'object', additionalProperties: false, required: ['name', 'lastName', 'email'], properties: { name: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string', format: 'email' }, description: { type: 'string', nullable: true } } },
      ChangePasswordRequest: { type: 'object', additionalProperties: false, required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string', format: 'password' }, newPassword: { type: 'string', format: 'password', minLength: 8 } } },
      CreateVolunteerProfileRequest: { type: 'object', additionalProperties: false, required: ['description'], properties: { description: { type: 'string', minLength: 1 } } },
      CreatePetRequest: {
        type: 'object', required: ['name', 'type', 'birthDate', 'size', 'sex', 'hasPassport'],
        properties: {
          name: { type: 'string', minLength: 1 }, race: { type: 'string', nullable: true }, type: { type: 'string', enum: ['dog', 'cat', 'ferret'] }, birthDate: { type: 'string', format: 'date-time' }, size: { type: 'string', enum: ['small', 'medium', 'large'] }, sex: { type: 'string', enum: ['male', 'female'] }, hasPassport: { type: 'boolean' }, ownerId: { type: 'integer', minimum: 1, description: 'Accepted for backwards compatibility but ignored; ownership is derived from the bearer token.' }, microchipCode: { type: 'string', nullable: true }, passportNumber: { type: 'string', nullable: true }, countryOfOrigin: { type: 'string', nullable: true }, notes: { type: 'string', nullable: true }, allergies: { type: 'string', nullable: true }, activeMedications: { type: 'string', nullable: true }, medicalConditions: { type: 'string', nullable: true },
        },
      },
      Pet: { allOf: [{ type: 'object', required: ['id', 'ownerId'], properties: { id: { type: 'integer' }, ownerId: { type: 'integer', minimum: 1 }, profileImageUrl: { type: 'string', nullable: true, maxLength: 512 } } }, ref('CreatePetRequest')] },
      PetUpdateInput: { type: 'object', minProperties: 1, properties: { name: { type: 'string', minLength: 1 }, race: { type: 'string', nullable: true }, type: { type: 'string', enum: ['dog', 'cat', 'ferret'] }, birthDate: { type: 'string', format: 'date-time' }, size: { type: 'string', enum: ['small', 'medium', 'large'] }, sex: { type: 'string', enum: ['male', 'female'] }, hasPassport: { type: 'boolean' }, microchipCode: { type: 'string', nullable: true }, passportNumber: { type: 'string', nullable: true }, countryOfOrigin: { type: 'string', nullable: true }, notes: { type: 'string', nullable: true }, allergies: { type: 'string', nullable: true }, activeMedications: { type: 'string', nullable: true }, medicalConditions: { type: 'string', nullable: true } } },
      PetProcedure: { type: 'object', required: ['id', 'petType', 'name', 'age', 'description', 'status', 'dueAt', 'lastOccurredAt', 'recurrenceDays', 'explanation', 'source', 'version', 'region'], properties: { id: { type: 'integer' }, petType: { type: 'string', enum: ['dog', 'cat', 'ferret'] }, name: { type: 'string' }, age: { type: 'integer' }, description: { type: 'string', nullable: true }, status: { type: 'string', enum: ['DONE', 'MISSING', 'UPCOMING'] }, dueAt: { type: 'string', format: 'date-time', nullable: true }, lastOccurredAt: { type: 'string', format: 'date-time', nullable: true }, recurrenceDays: { type: 'integer', nullable: true }, explanation: { type: 'string' }, source: { type: 'string' }, version: { type: 'string' }, region: { type: 'string' } } },
      CreateCheckupRequest: { type: 'object', required: ['procedureId', 'date'], properties: { procedureId: { type: 'integer', minimum: 1 }, date: { type: 'string', format: 'date' }, notes: { type: 'string', nullable: true } } },
      UpdateCheckupRequest: { type: 'object', minProperties: 1, properties: { procedureId: { type: 'integer', minimum: 1 }, date: { type: 'string', format: 'date' }, notes: { type: 'string', nullable: true }, petId: { type: 'integer', minimum: 1, description: 'Legacy client field; authorization uses the checkup resource.' }, checkupId: { type: 'integer', minimum: 1, description: 'Legacy client field; the path parameter is authoritative.' } } },
      Checkup: { type: 'object', required: ['id', 'petId', 'procedureId', 'date', 'notes'], properties: { id: { type: 'integer' }, petId: { type: 'integer' }, procedureId: { type: 'integer' }, date: { type: 'string', format: 'date-time' }, notes: { type: 'string', nullable: true } } },
      CreateAppointmentRequest: { type: 'object', additionalProperties: false, required: ['petId', 'date', 'reason'], properties: { petId: { type: 'integer', minimum: 1 }, date: { type: 'string', format: 'date-time' }, reason: { type: 'string', enum: ['VACCINATION', 'GENERAL_CHECKUP', 'ANTI_PARASITIC_PRESCRIPTION', 'OPERATION', 'OTHERS'] }, notes: { type: 'string', nullable: true } } },
      Appointment: { type: 'object', additionalProperties: false, required: ['id', 'petId', 'date', 'reason', 'status', 'notes'], properties: { id: { type: 'integer' }, petId: { type: 'integer', minimum: 1 }, date: { type: 'string', format: 'date-time' }, reason: { type: 'string', enum: ['VACCINATION', 'GENERAL_CHECKUP', 'ANTI_PARASITIC_PRESCRIPTION', 'OPERATION', 'OTHERS'] }, status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show'] }, notes: { type: 'string', nullable: true } } },
      AppointmentUpdateInput: { type: 'object', minProperties: 1, properties: { date: { type: 'string', format: 'date-time' }, reason: { type: 'string', enum: ['VACCINATION', 'GENERAL_CHECKUP', 'ANTI_PARASITIC_PRESCRIPTION', 'OPERATION', 'OTHERS'] }, status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show'] }, notes: { type: 'string', nullable: true } } },
      HealthDocument: { type: 'object', required: ['id', 'petId', 'fileName', 'mimeType', 'sizeBytes', 'createdAt'], properties: { id: { type: 'integer' }, petId: { type: 'integer' }, healthEventId: { type: 'integer', nullable: true }, fileName: { type: 'string' }, mimeType: { type: 'string' }, sizeBytes: { type: 'integer' }, createdAt: { type: 'string', format: 'date-time' } } },
      HealthDocumentInput: { type: 'object', additionalProperties: false, required: ['fileName', 'mimeType', 'contentBase64'], properties: { healthEventId: { type: 'integer', minimum: 1, nullable: true }, fileName: { type: 'string', minLength: 1, maxLength: 191, pattern: '^[^\\r\\n]+$' }, mimeType: { type: 'string', enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] }, contentBase64: { type: 'string', format: 'byte', minLength: 4, maxLength: 6990508, description: 'Base64 content; decoded file size is limited to 5 MB and its signature must match mimeType.' } } },
      HealthEventFields: { type: 'object', required: ['type', 'occurredAt', 'title'], properties: { type: { type: 'string', enum: ['VACCINATION', 'GENERAL_CHECKUP', 'MEDICATION', 'TREATMENT', 'TEST', 'SURGERY', 'WEIGHT', 'OTHER'] }, occurredAt: { type: 'string', format: 'date-time' }, title: { type: 'string', minLength: 1, maxLength: 120 }, notes: { type: 'string', nullable: true, maxLength: 5000 }, provider: { type: 'string', nullable: true, maxLength: 191 }, result: { type: 'string', nullable: true, maxLength: 5000 }, dose: { type: 'string', nullable: true, maxLength: 120 }, lotNumber: { type: 'string', nullable: true, maxLength: 120 }, expiresAt: { type: 'string', format: 'date-time', nullable: true } } },
      CreateHealthEventRequest: { allOf: [ref('HealthEventFields'), { type: 'object', properties: { sourceAppointmentId: { type: 'integer', minimum: 1, nullable: true } } }] },
      UpdateHealthEventRequest: { allOf: [ref('HealthEventFields'), { not: { required: ['sourceAppointmentId'] } }] },
      HealthEvent: { allOf: [{ type: 'object', required: ['id', 'petId', 'enteredBy', 'source', 'verification', 'attachments', 'createdAt', 'updatedAt'], properties: { id: { type: 'integer' }, petId: { type: 'integer' }, enteredBy: { type: 'integer' }, verifiedBy: { type: 'integer', nullable: true }, source: { type: 'string', enum: ['OWNER', 'LEGACY_CHECKUP', 'APPOINTMENT'] }, verification: { type: 'string', enum: ['OWNER_REPORTED', 'VERIFIED'] }, sourceAppointmentId: { type: 'integer', nullable: true }, attachments: arrayOf('HealthDocument'), createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } }, ref('HealthEventFields')] },
      HealthSummaryOptions: { type: 'object', properties: { sections: { type: 'array', minItems: 1, uniqueItems: true, items: { type: 'string', enum: ['identity', 'critical', 'vaccinations', 'events'] } }, periodFrom: { type: 'string', format: 'date-time', nullable: true }, periodTo: { type: 'string', format: 'date-time', nullable: true } } },
      CreateHealthShareRequest: { allOf: [ref('HealthSummaryOptions'), { type: 'object', properties: { expiresInHours: { type: 'integer', minimum: 1, maximum: 168, default: 24 } } }] },
      HealthShare: { type: 'object', required: ['id', 'expiresAt', 'createdAt'], properties: { id: { type: 'integer' }, expiresAt: { type: 'string', format: 'date-time' }, revokedAt: { type: 'string', format: 'date-time', nullable: true }, createdAt: { type: 'string', format: 'date-time' } } },
      CreatedHealthShare: { type: 'object', required: ['id', 'token', 'expiresAt'], properties: { id: { type: 'integer' }, token: { type: 'string', description: 'Secret token returned only when the share is created.' }, expiresAt: { type: 'string', format: 'date-time' } } },
      ReminderPreferences: { type: 'object', additionalProperties: false, required: ['enabled', 'leadDays'], properties: { enabled: { type: 'boolean' }, leadDays: { type: 'integer', minimum: 1, maximum: 90 } } },
      Reminder: { type: 'object', required: ['id', 'petId', 'petName', 'source', 'title', 'dueAt', 'status', 'notifyNow'], properties: { id: { type: 'integer' }, petId: { type: 'integer' }, petName: { type: 'string' }, source: { type: 'string', enum: ['APPOINTMENT', 'PREVENTIVE_PLAN'] }, title: { type: 'string' }, dueAt: { type: 'string', format: 'date-time' }, status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] }, notifyNow: { type: 'boolean' } } },
      ReminderInbox: { type: 'object', required: ['preferences', 'reminders'], properties: { preferences: ref('ReminderPreferences'), reminders: arrayOf('Reminder') } },
      ReminderAction: { type: 'object', additionalProperties: false, required: ['action'], properties: { action: { type: 'string', enum: ['postpone', 'complete', 'cancel'] }, days: { type: 'integer', minimum: 1, maximum: 365, default: 7 } } },
    },
  },
} as const;
