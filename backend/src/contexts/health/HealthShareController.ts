import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import type { HealthShareService } from './app/HealthShareService.js';

const allowedSections = new Set(['identity', 'critical', 'vaccinations', 'events']);

export function parseSummaryOptions(body: Record<string, unknown>) {
  const sections = Array.isArray(body.sections) ? body.sections.filter((item): item is string => typeof item === 'string' && allowedSections.has(item)) : [...allowedSections];
  if (!sections.length) throw new Error('Select at least one section');
  const parseDate = (value: unknown) => value == null || value === '' ? null : new Date(String(value));
  const periodFrom = parseDate(body.periodFrom); const periodTo = parseDate(body.periodTo);
  if ((periodFrom && Number.isNaN(periodFrom.getTime())) || (periodTo && Number.isNaN(periodTo.getTime())) || (periodFrom && periodTo && periodFrom > periodTo)) throw new Error('Invalid period');
  return { sections, periodFrom, periodTo };
}

export class HealthShareController {
  constructor(private readonly shares: HealthShareService) {}

  async export(req: AuthenticatedRequest, res: Response): Promise<void> {
    try { const options = parseSummaryOptions(req.body); const html = await this.shares.exportHtml(Number(req.params.id), options); res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="cartilla-${Number(req.params.id)}.html"`); res.send(html); }
    catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid export' }); }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = parseSummaryOptions(req.body); const expiresInHours = Number(req.body.expiresInHours ?? 24);
      if (!Number.isInteger(expiresInHours) || expiresInHours < 1 || expiresInHours > 168) throw new Error('Expiry must be between 1 and 168 hours');
      res.status(201).json(await this.shares.create(Number(req.params.id), req.user.userId, options, expiresInHours));
    } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid share' }); }
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json(await this.shares.list(Number(req.params.id), req.user.userId));
  }

  async revoke(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!await this.shares.revoke(Number(req.params.id), req.user.userId)) { res.status(404).json({ error: 'Share not found' }); return; }
    res.status(204).send();
  }

  async publicView(token: string, res: Response): Promise<void> {
    const html = await this.shares.view(token);
    if (!html) { res.status(404).send('Este enlace no existe, ha caducado o fue revocado.'); return; }
    res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'private, no-store'); res.send(html);
  }
}
