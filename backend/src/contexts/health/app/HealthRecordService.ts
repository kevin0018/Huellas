import { HealthEventSource, type HealthEventType, Prisma, type PrismaClient } from '@prisma/client';
import type { ReminderService } from '../../reminder/ReminderService.js';

export interface HealthEventData {
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
}

export interface HealthDocumentData {
  fileName: string;
  mimeType: string;
  content: Buffer;
  healthEventId: number | null;
}

type EventWithAttachments = Prisma.HealthEventGetPayload<Record<string, never>> & {
  attachments?: Array<{ id: number; pet_id: number; health_event_id: number | null; file_name: string; mime_type: string; size_bytes: number; created_at: Date }>;
};

function serializeEvent(event: EventWithAttachments) {
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
      id: document.id,
      petId: document.pet_id,
      healthEventId: document.health_event_id,
      fileName: document.file_name,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      createdAt: document.created_at,
    })),
  };
}

function documentMetadata(document: { id: number; pet_id: number; health_event_id: number | null; file_name: string; mime_type: string; size_bytes: number; created_at: Date }) {
  return {
    id: document.id,
    petId: document.pet_id,
    healthEventId: document.health_event_id,
    fileName: document.file_name,
    mimeType: document.mime_type,
    sizeBytes: document.size_bytes,
    createdAt: document.created_at,
  };
}

export class HealthRecordService {
  constructor(
    private readonly database: PrismaClient,
    private readonly reminders: ReminderService,
  ) {}

  ownedEvent(id: number, ownerId: number) {
    return this.database.healthEvent.findFirst({ where: { id, pet: { owner_id: ownerId } } });
  }

  async listEvents(petId: number, ownerId: number) {
    const events = await this.database.healthEvent.findMany({
      where: { pet_id: petId, pet: { owner_id: ownerId } },
      orderBy: [{ occurred_at: 'desc' }, { id: 'desc' }],
      include: { attachments: { select: { id: true, pet_id: true, health_event_id: true, file_name: true, mime_type: true, size_bytes: true, created_at: true } } },
    });
    return events.map(serializeEvent);
  }

  async createEvent(petId: number, ownerId: number, input: HealthEventData) {
    if (input.sourceAppointmentId) {
      const appointment = await this.database.appointment.findFirst({
        where: { id: input.sourceAppointmentId, pet_id: petId, pet: { owner_id: ownerId } },
      });
      if (!appointment) throw new Error('Source appointment is not valid for this pet');
    }
    const event = await this.database.healthEvent.create({
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
        entered_by: ownerId,
        source: input.sourceAppointmentId ? HealthEventSource.APPOINTMENT : HealthEventSource.OWNER,
        source_appointment_id: input.sourceAppointmentId,
      },
    });
    await this.reminders.completePreventive(petId, event.type, event.title, event.occurred_at);
    if (event.source_appointment_id) {
      await this.database.reminder.updateMany({
        where: { source_key: `appointment:${event.source_appointment_id}`, status: 'PENDING' },
        data: { status: 'COMPLETED', completed_at: event.occurred_at, generated_action_at: event.occurred_at },
      });
    }
    return serializeEvent(event);
  }

  async updateEvent(id: number, ownerId: number, input: HealthEventData) {
    const existing = await this.ownedEvent(id, ownerId);
    if (!existing) return null;
    if (existing.source !== HealthEventSource.OWNER || existing.verified_by !== null) {
      throw new Error('Only owner-reported health events can be edited');
    }
    const event = await this.database.healthEvent.update({
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
    return serializeEvent(event);
  }

  async deleteEvent(id: number, ownerId: number): Promise<boolean> {
    if (!await this.ownedEvent(id, ownerId)) return false;
    await this.database.healthEvent.delete({ where: { id } });
    return true;
  }

  async createDocument(petId: number, ownerId: number, input: HealthDocumentData) {
    if (input.healthEventId) {
      const event = await this.database.healthEvent.findFirst({
        where: { id: input.healthEventId, pet_id: petId, pet: { owner_id: ownerId } },
      });
      if (!event) throw new Error('Health event is not valid for this pet');
    }
    const document = await this.database.healthDocument.create({
      data: { pet_id: petId, health_event_id: input.healthEventId, file_name: input.fileName, mime_type: input.mimeType, size_bytes: input.content.length, content: Uint8Array.from(input.content) },
    });
    return documentMetadata(document);
  }

  async getDocument(id: number, ownerId: number) {
    return this.database.healthDocument.findFirst({ where: { id, pet: { owner_id: ownerId } } });
  }

  async deleteDocument(id: number, ownerId: number): Promise<boolean> {
    const document = await this.getDocument(id, ownerId);
    if (!document) return false;
    await this.database.healthDocument.delete({ where: { id: document.id } });
    return true;
  }
}
