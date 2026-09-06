import { createHash, randomBytes } from 'crypto';
import type { PrismaClient } from '@prisma/client';

export interface HealthSummaryOptions {
  sections: string[];
  periodFrom: Date | null;
  periodTo: Date | null;
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const date = (value: Date) => value.toLocaleDateString('es-ES');

export class HealthShareService {
  constructor(private readonly database: PrismaClient) {}

  private async renderSummary(petId: number, { sections, periodFrom, periodTo }: HealthSummaryOptions): Promise<string> {
    const pet = await this.database.pet.findUniqueOrThrow({
      where: { id: petId },
      include: {
        owner: { include: { user: true } },
        health_events: {
          where: periodFrom || periodTo ? { occurred_at: { ...(periodFrom && { gte: periodFrom }), ...(periodTo && { lte: periodTo }) } } : {},
          orderBy: { occurred_at: 'desc' },
        },
      },
    });
    const events = pet.health_events;
    const rows = (items: typeof events) => items.map((event) => `<article><h3>${escapeHtml(event.title)}</h3><p>${date(event.occurred_at)} · ${escapeHtml(event.provider || 'Dato del propietario')} · ${event.verified_by ? 'Verificado' : 'Sin verificar'}</p>${event.dose ? `<p><b>Dosis:</b> ${escapeHtml(event.dose)}</p>` : ''}${event.result ? `<p><b>Resultado:</b> ${escapeHtml(event.result)}</p>` : ''}${event.notes ? `<p>${escapeHtml(event.notes)}</p>` : ''}</article>`).join('') || '<p>Sin registros en el periodo seleccionado.</p>';
    const generatedAt = new Date();
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cartilla de ${escapeHtml(pet.name)}</title><style>body{font:16px system-ui;max-width:850px;margin:40px auto;padding:0 24px;color:#30222e}header{border-bottom:3px solid #51344d}section{margin:28px 0}article{border-left:4px solid #baa9cb;padding:4px 16px;margin:16px 0}h1,h2{color:#51344d}.notice{background:#fff3cd;padding:16px;border-radius:8px}dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 18px}</style></head><body><header><h1>Resumen sanitario · ${escapeHtml(pet.name)}</h1><p>Generado el ${date(generatedAt)} por ${escapeHtml(`${pet.owner.user.name} ${pet.owner.user.last_name}`)}.</p></header>${sections.includes('identity') ? `<section><h2>Identidad</h2><dl><dt>Especie</dt><dd>${escapeHtml(pet.type)}</dd><dt>Nacimiento</dt><dd>${date(pet.birth_date)}</dd><dt>Microchip</dt><dd>${escapeHtml(pet.microchip_code || 'No registrado')}</dd></dl></section>` : ''}${sections.includes('critical') ? `<section><h2>Información crítica</h2><p><b>Alergias:</b> ${escapeHtml(pet.allergies || 'Ninguna registrada')}</p><p><b>Medicación activa:</b> ${escapeHtml(pet.active_medications || 'Ninguna registrada')}</p><p><b>Condiciones:</b> ${escapeHtml(pet.medical_conditions || 'Ninguna registrada')}</p></section>` : ''}${sections.includes('vaccinations') ? `<section><h2>Vacunas</h2>${rows(events.filter((event) => event.type === 'VACCINATION'))}</section>` : ''}${sections.includes('events') ? `<section><h2>Eventos recientes</h2>${rows(events.filter((event) => event.type !== 'VACCINATION'))}</section>` : ''}<p class="notice"><b>Aviso:</b> resumen informativo generado por Huellas. Incluye datos introducidos por el propietario y no sustituye una historia clínica ni el criterio veterinario.</p></body></html>`;
  }

  exportHtml(petId: number, options: HealthSummaryOptions) {
    return this.renderSummary(petId, options);
  }

  async create(petId: number, ownerId: number, options: HealthSummaryOptions, expiresInHours: number) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const share = await this.database.healthShare.create({
      data: {
        pet_id: petId,
        token_hash: tokenHash,
        sections: options.sections,
        period_from: options.periodFrom,
        period_to: options.periodTo,
        expires_at: new Date(Date.now() + expiresInHours * 3600000),
        created_by: ownerId,
      },
    });
    return { id: share.id, token, expiresAt: share.expires_at };
  }

  async list(petId: number, ownerId: number) {
    const shares = await this.database.healthShare.findMany({
      where: { pet_id: petId, created_by: ownerId },
      orderBy: { created_at: 'desc' },
    });
    return shares.map((share) => ({ id: share.id, expiresAt: share.expires_at, revokedAt: share.revoked_at, createdAt: share.created_at }));
  }

  async revoke(id: number, ownerId: number): Promise<boolean> {
    const share = await this.database.healthShare.findFirst({ where: { id, pet: { owner_id: ownerId } } });
    if (!share) return false;
    await this.database.healthShare.update({ where: { id: share.id }, data: { revoked_at: new Date() } });
    return true;
  }

  async view(token: string): Promise<string | null> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const share = await this.database.healthShare.findFirst({
      where: { token_hash: tokenHash, revoked_at: null, expires_at: { gt: new Date() } },
    });
    if (!share) return null;
    return this.renderSummary(share.pet_id, {
      sections: share.sections as string[],
      periodFrom: share.period_from,
      periodTo: share.period_to,
    });
  }
}
