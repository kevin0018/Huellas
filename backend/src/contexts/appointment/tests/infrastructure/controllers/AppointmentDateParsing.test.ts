import { describe, expect, it } from 'vitest';
import { parseZonedDate } from '../../../infrastructure/controllers/AppointmentController.js';

describe('appointment timezone parsing', () => {
  it('preserves the instant supplied with a timezone offset', () => {
    expect(parseZonedDate('2026-10-25T02:30:00+02:00')?.toISOString())
      .toBe('2026-10-25T00:30:00.000Z');
  });

  it('rejects local timestamps without an explicit timezone', () => {
    expect(parseZonedDate('2026-10-25T02:30:00')).toBeNull();
  });
});
