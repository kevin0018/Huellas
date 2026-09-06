import { describe, expect, it } from 'vitest';
import { parseHealthDocument } from './HealthDocumentController.js';

describe('parseHealthDocument', () => {
  it('accepts a supported private document', () => {
    const parsed = parseHealthDocument({ fileName: 'vacuna.pdf', mimeType: 'application/pdf', contentBase64: Buffer.from('%PDF-test').toString('base64'), healthEventId: 4 });
    expect(parsed.content.toString()).toBe('%PDF-test');
    expect(parsed.healthEventId).toBe(4);
  });

  it('rejects unsupported formats', () => {
    expect(() => parseHealthDocument({ fileName: 'data.exe', mimeType: 'application/octet-stream', contentBase64: 'YQ==' })).toThrow('Only PDF');
  });

  it('rejects a forged MIME type', () => {
    expect(() => parseHealthDocument({ fileName: 'fake.pdf', mimeType: 'application/pdf', contentBase64: Buffer.from('not a pdf').toString('base64') })).toThrow('does not match');
  });

  it('rejects files larger than 5 MB', () => {
    expect(() => parseHealthDocument({ fileName: 'large.pdf', mimeType: 'application/pdf', contentBase64: Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64') })).toThrow('5 MB');
  });
});
