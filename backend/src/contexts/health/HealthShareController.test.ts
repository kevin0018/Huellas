import { describe, expect, it } from 'vitest';
import { parseSummaryOptions } from './HealthShareController.js';

describe('parseSummaryOptions', () => {
  it('accepts selected sections and a bounded period', () => {
    const options = parseSummaryOptions({ sections: ['identity', 'vaccinations'], periodFrom: '2026-01-01', periodTo: '2026-12-31' });
    expect(options.sections).toEqual(['identity', 'vaccinations']);
    expect(options.periodFrom?.getUTCFullYear()).toBe(2026);
  });

  it('rejects an inverted period', () => {
    expect(() => parseSummaryOptions({ periodFrom: '2027-01-01', periodTo: '2026-01-01' })).toThrow('Invalid period');
  });

  it('rejects an empty section selection', () => {
    expect(() => parseSummaryOptions({ sections: ['unknown'] })).toThrow('Select at least one');
  });
});
