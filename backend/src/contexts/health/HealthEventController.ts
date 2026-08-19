import type { Response } from 'express';
import { HealthEventSource, HealthEventType, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import { completePreventiveReminders } from '../reminder/ReminderService.js';

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

type EventWithAttachments = Prisma.HealthEventGetPayload<Record<string, never>> & {
  attachments?: Array<{ id: number; pet_id: number; health_event_id: number | null; file_name: string; mime_type: string; size_bytes: number; created_at: Date }>;
};

function serializeHealthEvent(event: EventWithAttachments) {
  return {
    id: event.id,
    petId: event.pet_id,
    type: event.type,
    occurredAt: event.occurred_at,
    title: event.title,
    notes: event.notes,
    provider: event.provider,
    result: event.result,
    dose: event.dose,
    lotNumber: event.lot_number,
    expiresAt: event.expires_at,
    enteredBy: event.entered_by,
    verification: event.verified_by === null ? 'OWNER_REPORTED' : 'VERIFIED',
    verifiedBy: event.verified_by,
    source: event.source,
    sourceAppointmentId: event.source_appointment_id,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    attachments: (event.attachments || []).map((document) => ({
      id: document.id, petId: document.pet_id, healthEventId: document.health_event_id,
      fileName: document.file_name, mimeType: document.mime_type, sizeBytes: document.size_bytes, createdAt: document.created_at,
    })),
  };
}

async function ownedEvent(id: number, ownerId: number) {
  return prisma.healthEvent.findFirst({ where: { id, pet: { owner_id: ownerId } } });
}

export class HealthEventController {
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const petId = Number(req.params.id);
    const events = await prisma.healthEvent.findMany({
      where: { pet_id: petId, pet: { owner_id: req.user.userId } },
      orderBy: [{ occurred_at: 'desc' }, { id: 'desc' }],
      include: { attachments: { select: { id: true, pet_id: true, health_event_id: true, file_name: true, mime_type: true, size_bytes: true, created_at: true } } },
    });
    res.json(events.map(serializeHealthEvent));
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = Number(req.params.id);
      const input = parseHealthEventInput(req.body as Record<string, unknown>);
      if (input.sourceAppointmentId) {
        const appointment = await prisma.appointment.findFirst({
          where: { id: input.sourceAppointmentId, pet_id: petId, pet: { owner_id: req.user.userId } },
        });
        if (!appointment) {
          res.status(400).json({ error: 'Source appointment is not valid for this pet' });
          return;
        }
      }
      const event = await prisma.healthEvent.create({
        data: {
          pet_id: petId,
          type: input.type,
          occurred_at: input.occurredAt,
          title: input.title,
          notes: input.notes,
          provider: input.provider,
          result: input.result,
          dose: input.dose,
          lot_number: input.lotNumber,
          expires_at: input.expiresAt,
          entered_by: req.user.userId,
          source: input.sourceAppointmentId ? HealthEventSource.APPOINTMENT : HealthEventSource.OWNER,
          source_appointment_id: input.sourceAppointmentId,
        },
      });
      await completePreventiveReminders(petId, event.type, event.title, event.occurred_at);
      if (event.source_appointment_id) {
        await prisma.reminder.updateMany({ where: { source_key: `appointment:${event.source_appointment_id}`, status: 'PENDING' }, data: { status: 'COMPLETED', completed_at: event.occurred_at, generated_action_at: event.occurred_at } });
      }
      res.status(201).json(serializeHealthEvent(event));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid health event' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!await ownedEvent(id, req.user.userId)) {
        res.status(404).json({ error: 'Health event not found' });
        return;
      }
      const input = parseHealthEventInput(req.body as Record<string, unknown>);
      const event = await prisma.healthEvent.update({
        where: { id },
        data: {
          type: input.type,
          occurred_at: input.occurredAt,
          title: input.title,
          notes: input.notes,
          provider: input.provider,
          result: input.result,
          dose: input.dose,
          lot_number: input.lotNumber,
          expires_at: input.expiresAt,
        },
      });
      res.json(serializeHealthEvent(event));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid health event' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!await ownedEvent(id, req.user.userId)) {
      res.status(404).json({ error: 'Health event not found' });
      return;
    }
    await prisma.healthEvent.delete({ where: { id } });
    res.status(204).send();
  }
}
