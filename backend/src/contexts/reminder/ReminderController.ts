import type { Response } from 'express';
import { ReminderStatus, type PrismaClient } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import { syncOwnerReminders } from './ReminderService.js';

export class ReminderController {
  constructor(
    private readonly database: PrismaClient = prisma,
    private readonly synchronizeOwner: typeof syncOwnerReminders = syncOwnerReminders,
  ) {}

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.synchronizeOwner(req.user.userId);
    const [owner, reminders] = await Promise.all([
      this.database.owner.findUniqueOrThrow({ where: { id: req.user.userId } }),
      this.database.reminder.findMany({ where: { pet: { owner_id: req.user.userId }, status: ReminderStatus.PENDING, OR: [{ snoozed_until: null }, { snoozed_until: { lte: new Date() } }] }, include: { pet: { select: { id: true, name: true } } }, orderBy: { due_at: 'asc' } }),
    ]);
    const notificationCutoff = Date.now() + owner.reminder_lead_days * 86400000;
    res.json({ preferences: { enabled: owner.notifications_enabled, leadDays: owner.reminder_lead_days }, reminders: reminders.map((item) => ({ id: item.id, petId: item.pet_id, petName: item.pet.name, source: item.source, title: item.title, dueAt: item.due_at, status: item.status, notifyNow: owner.notifications_enabled && item.due_at.getTime() <= notificationCutoff })) });
  }

  async action(req: AuthenticatedRequest, res: Response): Promise<void> {
    const reminder = await this.database.reminder.findFirst({ where: { id: Number(req.params.id), pet: { owner_id: req.user.userId } } });
    if (!reminder) { res.status(404).json({ error: 'Reminder not found' }); return; }
    const action = req.body.action;
    const now = new Date();
    if (action === 'postpone') {
      const days = Number(req.body.days ?? 7);
      if (!Number.isInteger(days) || days < 1 || days > 365) { res.status(400).json({ error: 'Postpone days must be between 1 and 365' }); return; }
      await this.database.reminder.update({ where: { id: reminder.id }, data: { snoozed_until: new Date(now.getTime() + days * 86400000) } });
    } else if (action === 'complete') {
      await this.database.reminder.update({ where: { id: reminder.id }, data: { status: ReminderStatus.COMPLETED, completed_at: now, generated_action_at: now } });
    } else if (action === 'cancel') {
      await this.database.reminder.update({ where: { id: reminder.id }, data: { status: ReminderStatus.CANCELLED, cancelled_at: now } });
    } else { res.status(400).json({ error: 'Invalid reminder action' }); return; }
    res.status(204).send();
  }

  async preferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    const enabled = req.body.enabled;
    const leadDays = Number(req.body.leadDays);
    if (typeof enabled !== 'boolean' || !Number.isInteger(leadDays) || leadDays < 1 || leadDays > 90) { res.status(400).json({ error: 'Invalid reminder preferences' }); return; }
    const owner = await this.database.owner.update({ where: { id: req.user.userId }, data: { notifications_enabled: enabled, reminder_lead_days: leadDays } });
    res.json({ enabled: owner.notifications_enabled, leadDays: owner.reminder_lead_days });
  }
}
