import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';
import { prisma } from '../../db/prisma.js';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';

const allowedSections = new Set(['identity', 'critical', 'vaccinations', 'events']);

export function parseSummaryOptions(body: Record<string, unknown>) {
  const sections = Array.isArray(body.sections) ? body.sections.filter((item): item is string => typeof item === 'string' && allowedSections.has(item)) : [...allowedSections];
  if (!sections.length) throw new Error('Select at least one section');
  const parseDate = (value: unknown) => value == null || value === '' ? null : new Date(String(value));
  const periodFrom = parseDate(body.periodFrom); const periodTo = parseDate(body.periodTo);
  if ((periodFrom && Number.isNaN(periodFrom.getTime())) || (periodTo && Number.isNaN(periodTo.getTime())) || (periodFrom && periodTo && periodFrom > periodTo)) throw new Error('Invalid period');
  return { sections, periodFrom, periodTo };
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const date = (value: Date) => value.toLocaleDateString('es-ES');

async function renderSummary(petId: number, sections: string[], periodFrom: Date | null, periodTo: Date | null): Promise<string> {
  const pet = await prisma.pet.findUniqueOrThrow({ where: { id: petId }, include: { owner: { include: { user: true } }, health_events: { where: periodFrom || periodTo ? { occurred_at: { ...(periodFrom && { gte: periodFrom }), ...(periodTo && { lte: periodTo }) } } : {}, orderBy: { occurred_at: 'desc' } } } });
  const events = pet.health_events;
  const rows = (items: typeof events) => items.map((event) => `<article><h3>${escapeHtml(event.title)}</h3><p>${date(event.occurred_at)} · ${escapeHtml(event.provider || 'Dato del propietario')} · ${event.verified_by ? 'Verificado' : 'Sin verificar'}</p>${event.dose ? `<p><b>Dosis:</b> ${escapeHtml(event.dose)}</p>` : ''}${event.result ? `<p><b>Resultado:</b> ${escapeHtml(event.result)}</p>` : ''}${event.notes ? `<p>${escapeHtml(event.notes)}</p>` : ''}</article>`).join('') || '<p>Sin registros en el periodo seleccionado.</p>';
  const generatedAt = new Date();
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cartilla de ${escapeHtml(pet.name)}</title><style>body{font:16px system-ui;max-width:850px;margin:40px auto;padding:0 24px;color:#30222e}header{border-bottom:3px solid #51344d}section{margin:28px 0}article{border-left:4px solid #baa9cb;padding:4px 16px;margin:16px 0}h1,h2{color:#51344d}.notice{background:#fff3cd;padding:16px;border-radius:8px}dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 18px}</style></head><body><header><h1>Resumen sanitario · ${escapeHtml(pet.name)}</h1><p>Generado el ${date(generatedAt)} por ${escapeHtml(`${pet.owner.user.name} ${pet.owner.user.last_name}`)}.</p></header>${sections.includes('identity') ? `<section><h2>Identidad</h2><dl><dt>Especie</dt><dd>${escapeHtml(pet.type)}</dd><dt>Nacimiento</dt><dd>${date(pet.birth_date)}</dd><dt>Microchip</dt><dd>${escapeHtml(pet.microchip_code || 'No registrado')}</dd></dl></section>` : ''}${sections.includes('critical') ? `<section><h2>Información crítica</h2><p><b>Alergias:</b> ${escapeHtml(pet.allergies || 'Ninguna registrada')}</p><p><b>Medicación activa:</b> ${escapeHtml(pet.active_medications || 'Ninguna registrada')}</p><p><b>Condiciones:</b> ${escapeHtml(pet.medical_conditions || 'Ninguna registrada')}</p></section>` : ''}${sections.includes('vaccinations') ? `<section><h2>Vacunas</h2>${rows(events.filter((event) => event.type === 'VACCINATION'))}</section>` : ''}${sections.includes('events') ? `<section><h2>Eventos recientes</h2>${rows(events.filter((event) => event.type !== 'VACCINATION'))}</section>` : ''}<p class="notice"><b>Aviso:</b> resumen informativo generado por Huellas. Incluye datos introducidos por el propietario y no sustituye una historia clínica ni el criterio veterinario.</p></body></html>`;
}

export class HealthShareController {
  async export(req: AuthenticatedRequest, res: Response): Promise<void> {
    try { const options = parseSummaryOptions(req.body); const html = await renderSummary(Number(req.params.id), options.sections, options.periodFrom, options.periodTo); res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="cartilla-${Number(req.params.id)}.html"`); res.send(html); }
    catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid export' }); }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = parseSummaryOptions(req.body); const expiresInHours = Number(req.body.expiresInHours ?? 24);
      if (!Number.isInteger(expiresInHours) || expiresInHours < 1 || expiresInHours > 168) throw new Error('Expiry must be between 1 and 168 hours');
      const token = randomBytes(32).toString('base64url'); const tokenHash = createHash('sha256').update(token).digest('hex');
      const share = await prisma.healthShare.create({ data: { pet_id: Number(req.params.id), token_hash: tokenHash, sections: options.sections, period_from: options.periodFrom, period_to: options.periodTo, expires_at: new Date(Date.now() + expiresInHours * 3600000), created_by: req.user.userId } });
      res.status(201).json({ id: share.id, token, expiresAt: share.expires_at });
    } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid share' }); }
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const shares = await prisma.healthShare.findMany({ where: { pet_id: Number(req.params.id), created_by: req.user.userId }, orderBy: { created_at: 'desc' } });
    res.json(shares.map((share) => ({ id: share.id, expiresAt: share.expires_at, revokedAt: share.revoked_at, createdAt: share.created_at })));
  }

  async revoke(req: AuthenticatedRequest, res: Response): Promise<void> {
    const share = await prisma.healthShare.findFirst({ where: { id: Number(req.params.id), pet: { owner_id: req.user.userId } } });
    if (!share) { res.status(404).json({ error: 'Share not found' }); return; }
    await prisma.healthShare.update({ where: { id: share.id }, data: { revoked_at: new Date() } }); res.status(204).send();
  }

  async publicView(token: string, res: Response): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const share = await prisma.healthShare.findFirst({ where: { token_hash: tokenHash, revoked_at: null, expires_at: { gt: new Date() } } });
    if (!share) { res.status(404).send('Este enlace no existe, ha caducado o fue revocado.'); return; }
    const html = await renderSummary(share.pet_id, share.sections as string[], share.period_from, share.period_to); res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'private, no-store'); res.send(html);
  }
}
