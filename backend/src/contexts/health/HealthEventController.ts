import type { Response } from 'express';
import { HealthEventType } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import type { HealthRecordService } from './app/HealthRecordService.js';

type HealthEventInput = {
  type: HealthEventType;
  occurredAt: Date;
  title: string;
  notes: string | null;
  provider: string | null;
  result: string | null;
  dose: string | null;
  lotNumber: string | null;
  expiresAt: Date | null;
  sourceAppointmentId: number | null;
};

const zonedTimestamp = /(?:Z|[+-]\d{2}:\d{2})$/;

function optionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) {
    throw new Error(`${field} must be text with at most ${max} characters`);
  }
  return value.trim();
}

function optionalDate(value: unknown, field: string): Date | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !zonedTimestamp.test(value)) {
    throw new Error(`${field} must be an ISO 8601 timestamp with timezone`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${field} is invalid`);
  return parsed;
}

export function parseHealthEventInput(body: Record<string, unknown>): HealthEventInput {
  if (!Object.values(HealthEventType).includes(body.type as HealthEventType)) {
    throw new Error('Invalid health event type');
  }
  const title = optionalText(body.title, 'title', 120);
  if (!title) throw new Error('title is required');
  const occurredAt = optionalDate(body.occurredAt, 'occurredAt');
  if (!occurredAt) throw new Error('occurredAt is required');

  const type = body.type as HealthEventType;
  const lotNumber = optionalText(body.lotNumber, 'lotNumber', 120);
  const dose = optionalText(body.dose, 'dose', 120);
  const expiresAt = optionalDate(body.expiresAt, 'expiresAt');
  if (lotNumber && type !== HealthEventType.VACCINATION) {
    throw new Error('lotNumber is only valid for vaccinations');
  }
  const dosageTypes = new Set<HealthEventType>([
    HealthEventType.VACCINATION,
    HealthEventType.MEDICATION,
    HealthEventType.TREATMENT,
  ]);
  if (dose && !dosageTypes.has(type)) {
    throw new Error('dose is not valid for this event type');
  }
  if (expiresAt && !dosageTypes.has(type)) {
    throw new Error('expiresAt is not valid for this event type');
  }

  const sourceAppointmentId = body.sourceAppointmentId === undefined || body.sourceAppointmentId === null
    ? null
    : Number(body.sourceAppointmentId);
  if (sourceAppointmentId !== null && (!Number.isInteger(sourceAppointmentId) || sourceAppointmentId <= 0)) {
    throw new Error('sourceAppointmentId must be a positive integer');
  }

  return {
    type,
    occurredAt,
    title,
    notes: optionalText(body.notes, 'notes', 5000),
    provider: optionalText(body.provider, 'provider', 191),
    result: optionalText(body.result, 'result', 5000),
    dose,
    lotNumber,
    expiresAt,
    sourceAppointmentId,
  };
}

export class HealthEventController {
  constructor(private readonly healthRecords: HealthRecordService) {}

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const petId = Number(req.params.id);
    res.json(await this.healthRecords.listEvents(petId, req.user.userId));
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = Number(req.params.id);
      const input = parseHealthEventInput(req.body as Record<string, unknown>);
      res.status(201).json(await this.healthRecords.createEvent(petId, req.user.userId, input));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid health event' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const event = await this.healthRecords.updateEvent(
        id,
        req.user.userId,
        parseHealthEventInput(req.body as Record<string, unknown>),
      );
      if (!event) {
        res.status(404).json({ error: 'Health event not found' });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid health event' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!await this.healthRecords.deleteEvent(id, req.user.userId)) {
      res.status(404).json({ error: 'Health event not found' });
      return;
    }
    res.status(204).send();
  }
}
