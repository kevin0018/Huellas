import { describe, expect, it } from 'vitest';
import { PetProcedureStatus } from '../../../../types/procedure.js';
import { calculatePreventiveStatus } from './GetPetProceduresStatusController.js';

const day = 24 * 60 * 60 * 1000;

describe('calculatePreventiveStatus', () => {
  it('makes an annual procedure due again after its cycle', () => {
    const result = calculatePreventiveStatus({
      birthDate: new Date('2020-01-01T00:00:00Z'), startsAtAgeWeeks: 8, recurrenceDays: 365,
      lastOccurredAt: new Date('2025-01-01T00:00:00Z'), windowBeforeDays: 14, windowAfterDays: 14,
      now: new Date('2026-02-01T00:00:00Z'),
    });
    expect(result.status).toBe(PetProcedureStatus.MISSING);
  });

  it('calculates successive fortnightly due dates', () => {
    const last = new Date('2026-08-01T00:00:00Z');
    const result = calculatePreventiveStatus({
      birthDate: new Date('2026-01-01T00:00:00Z'), startsAtAgeWeeks: 2, recurrenceDays: 14,
      lastOccurredAt: last, windowBeforeDays: 2, windowAfterDays: 2,
      now: new Date(last.getTime() + 13 * day),
    });
    expect(result.status).toBe(PetProcedureStatus.UPCOMING);
    expect(result.dueAt?.toISOString()).toBe('2026-08-15T00:00:00.000Z');
  });

  it('uses age when there is no history', () => {
    const result = calculatePreventiveStatus({
      birthDate: new Date('2026-01-01T00:00:00Z'), startsAtAgeWeeks: 8, recurrenceDays: null,
      lastOccurredAt: null, windowBeforeDays: 7, windowAfterDays: 7, now: new Date('2026-01-10T00:00:00Z'),
    });
    expect(result.status).toBe(PetProcedureStatus.UPCOMING);
    expect(result.dueAt).not.toBeNull();
  });
});
