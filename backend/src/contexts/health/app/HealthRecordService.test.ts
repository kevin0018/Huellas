import { HealthEventSource, HealthEventType, type PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { ReminderService } from '../../reminder/ReminderService.js';
import { HealthRecordService, type HealthEventData } from './HealthRecordService.js';

const input: HealthEventData = {
  type: HealthEventType.VACCINATION,
  occurredAt: new Date('2026-08-20T10:00:00Z'),
  title: 'Rabia',
  notes: null,
  provider: null,
  result: null,
  dose: '1 ml',
  lotNumber: 'LOT-42',
  expiresAt: null,
  sourceAppointmentId: null,
};

function eventRow() {
  return {
    id: 12,
    pet_id: 4,
    type: input.type,
    occurred_at: input.occurredAt,
    title: input.title,
    notes: input.notes,
    provider: input.provider,
    result: input.result,
    dose: input.dose,
    lot_number: input.lotNumber,
    expires_at: input.expiresAt,
    entered_by: 7,
    verified_by: null,
    source: HealthEventSource.OWNER,
    source_appointment_id: null,
    legacy_checkup_id: null,
    created_at: input.occurredAt,
    updated_at: input.occurredAt,
  };
}

describe('HealthRecordService', () => {
  it('persists an event and delegates preventive reminder completion', async () => {
    const create = vi.fn().mockResolvedValue(eventRow());
    const completePreventive = vi.fn().mockResolvedValue(undefined);
    const database = { healthEvent: { create } } as unknown as PrismaClient;
    const reminders = { completePreventive } as unknown as ReminderService;

    const result = await new HealthRecordService(database, reminders).createEvent(4, 7, input);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ pet_id: 4, entered_by: 7, source: HealthEventSource.OWNER }),
    }));
    expect(completePreventive).toHaveBeenCalledWith(4, HealthEventType.VACCINATION, 'Rabia', input.occurredAt);
    expect(result).toMatchObject({ id: 12, petId: 4, verification: 'OWNER_REPORTED' });
  });

  it('rejects an appointment that does not belong to the pet owner', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const create = vi.fn();
    const database = { appointment: { findFirst }, healthEvent: { create } } as unknown as PrismaClient;
    const reminders = {} as ReminderService;

    await expect(new HealthRecordService(database, reminders).createEvent(4, 7, { ...input, sourceAppointmentId: 99 }))
      .rejects.toThrow('Source appointment is not valid for this pet');
    expect(create).not.toHaveBeenCalled();
  });
});
