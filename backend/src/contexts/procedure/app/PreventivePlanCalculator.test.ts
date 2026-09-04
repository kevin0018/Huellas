import { describe, expect, it } from 'vitest';
import { calculatePreventiveStatus } from './PreventivePlanCalculator.js';

const rule = {
  birthDate: new Date('2024-01-01T00:00:00Z'), startsAtAgeWeeks: 8,
  recurrenceDays: 365, lastOccurredAt: new Date('2024-03-01T12:00:00Z'),
  windowBeforeDays: 14, windowAfterDays: 7,
};

describe('preventive plan date boundaries', () => {
  it.each([
    ['2025-02-15T11:59:59.999Z', 'DONE'],
    ['2025-02-15T12:00:00.000Z', 'UPCOMING'],
    ['2025-03-08T12:00:00.000Z', 'UPCOMING'],
    ['2025-03-08T12:00:00.001Z', 'MISSING'],
  ])('classifies %s as %s without dropping window boundaries', (now, status) => {
    const result = calculatePreventiveStatus({ ...rule, now: new Date(now) });
    expect(result.status).toBe(status);
    expect(result.dueAt?.toISOString()).toBe('2025-03-01T12:00:00.000Z');
  });

  it('uses age for the first care date even across a leap day', () => {
    const result = calculatePreventiveStatus({
      ...rule, birthDate: new Date('2024-02-01T00:00:00Z'), startsAtAgeWeeks: 4,
      lastOccurredAt: null, now: new Date('2024-02-02T00:00:00Z'),
    });
    expect(result.dueAt?.toISOString()).toBe('2024-02-29T00:00:00.000Z');
    expect(result.status).toBe('UPCOMING');
  });

  it('does not invent a next date for a completed non-recurring procedure', () => {
    const result = calculatePreventiveStatus({ ...rule, recurrenceDays: null, now: new Date('2030-01-01T00:00:00Z') });
    expect(result.status).toBe('DONE');
    expect(result.dueAt).toBeNull();
  });

  it('uses elapsed days across leap years instead of a calendar-year anniversary', () => {
    const result = calculatePreventiveStatus({
      ...rule, lastOccurredAt: new Date('2024-02-29T12:00:00Z'), now: new Date('2024-03-01T00:00:00Z'),
    });
    expect(result.dueAt?.toISOString()).toBe('2025-02-28T12:00:00.000Z');
  });
});
