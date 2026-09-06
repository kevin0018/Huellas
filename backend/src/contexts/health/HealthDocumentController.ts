import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import type { HealthRecordService } from './app/HealthRecordService.js';

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export function parseHealthDocument(body: Record<string, unknown>) {
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
  const contentBase64 = typeof body.contentBase64 === 'string' ? body.contentBase64 : '';
  if (!fileName || fileName.length > 191 || /[\r\n]/.test(fileName)) throw new Error('Invalid file name');
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Only PDF, JPEG, PNG and WebP files are allowed');
  if (!contentBase64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(contentBase64)) throw new Error('Invalid base64 content');
  const content = Buffer.from(contentBase64, 'base64');
  if (!content.length || content.length > MAX_DOCUMENT_BYTES) throw new Error('File must be between 1 byte and 5 MB');
  const signatureMatches = mimeType === 'application/pdf'
    ? content.subarray(0, 5).toString() === '%PDF-'
    : mimeType === 'image/jpeg'
      ? content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
      : mimeType === 'image/png'
        ? content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : content.subarray(0, 4).toString() === 'RIFF' && content.subarray(8, 12).toString() === 'WEBP';
  if (!signatureMatches) throw new Error('File content does not match its declared type');
  const healthEventId = body.healthEventId == null ? null : Number(body.healthEventId);
  if (healthEventId !== null && (!Number.isInteger(healthEventId) || healthEventId <= 0)) throw new Error('Invalid health event');
  return { fileName, mimeType, content, healthEventId };
}

export class HealthDocumentController {
  constructor(private readonly healthRecords: HealthRecordService) {}

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = Number(req.params.id);
      const input = parseHealthDocument(req.body as Record<string, unknown>);
      res.status(201).json(await this.healthRecords.createDocument(petId, req.user.userId, input));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid document' });
    }
  }

  async download(req: AuthenticatedRequest, res: Response): Promise<void> {
    const document = await this.healthRecords.getDocument(Number(req.params.id), req.user.userId);
    if (!document) { res.status(404).json({ error: 'Document not found' }); return; }
    const safeName = document.file_name.replace(/["\\]/g, '_');
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Length', String(document.size_bytes));
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(document.content);
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!await this.healthRecords.deleteDocument(Number(req.params.id), req.user.userId)) { res.status(404).json({ error: 'Document not found' }); return; }
    res.status(204).send();
  }
}
