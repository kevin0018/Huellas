import { HealthEventType } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { parseHealthEventInput } from './HealthEventController.js';

describe('parseHealthEventInput', () => {
  it('keeps vaccination-specific data in a unified event', () => {
    const event = parseHealthEventInput({
      type: 'VACCINATION',
      occurredAt: '2026-08-19T10:30:00+02:00',
      title: 'Rabies booster',
      dose: '1 ml',
      lotNumber: 'LOT-42',
      expiresAt: '2027-08-19T10:30:00+02:00',
    });

    expect(event.type).toBe(HealthEventType.VACCINATION);
    expect(event.occurredAt.toISOString()).toBe('2026-08-19T08:30:00.000Z');
    expect(event.lotNumber).toBe('LOT-42');
  });

  it('supports medication without overloading vaccine fields', () => {
    const event = parseHealthEventInput({
      type: 'MEDICATION',
      occurredAt: '2026-08-19T08:30:00Z',
      title: 'Anti-inflammatory',
      dose: '5 mg every 24 hours',
    });

    expect(event.dose).toBe('5 mg every 24 hours');
    expect(event.lotNumber).toBeNull();
  });

  it('rejects vaccine-only data on a general visit', () => {
    expect(() => parseHealthEventInput({
      type: 'GENERAL_CHECKUP',
      occurredAt: '2026-08-19T08:30:00Z',
      title: 'Annual visit',
      lotNumber: 'NOT-APPLICABLE',
    })).toThrow('lotNumber is only valid for vaccinations');
  });

  it('requires an explicit timezone', () => {
    expect(() => parseHealthEventInput({
      type: 'GENERAL_CHECKUP',
      occurredAt: '2026-08-19T08:30:00',
      title: 'Annual visit',
    })).toThrow('timestamp with timezone');
  });
});
