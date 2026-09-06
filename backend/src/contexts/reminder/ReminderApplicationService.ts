import { ReminderStatus, type PrismaClient } from '@prisma/client';
import { ReminderService } from './ReminderService.js';

export class ReminderApplicationService {
  constructor(
    private readonly database: PrismaClient,
    private readonly reminders: ReminderService,
  ) {}

  async list(ownerId: number) {
    await this.reminders.syncOwner(ownerId);
    const [owner, reminders] = await Promise.all([
      this.database.owner.findUniqueOrThrow({ where: { id: ownerId } }),
      this.database.reminder.findMany({
        where: {
          pet: { owner_id: ownerId },
          status: ReminderStatus.PENDING,
          OR: [{ snoozed_until: null }, { snoozed_until: { lte: new Date() } }],
        },
        include: { pet: { select: { id: true, name: true } } },
        orderBy: { due_at: 'asc' },
      }),
    ]);
    const notificationCutoff = Date.now() + owner.reminder_lead_days * 86400000;
    return {
      preferences: { enabled: owner.notifications_enabled, leadDays: owner.reminder_lead_days },
      reminders: reminders.map((item) => ({
        id: item.id,
        petId: item.pet_id,
        petName: item.pet.name,
        source: item.source,
        title: item.title,
        dueAt: item.due_at,
        status: item.status,
        notifyNow: owner.notifications_enabled && item.due_at.getTime() <= notificationCutoff,
      })),
    };
  }

  async applyAction(ownerId: number, reminderId: number, action: unknown, daysValue: unknown): Promise<'not-found' | 'invalid' | 'ok'> {
    const reminder = await this.database.reminder.findFirst({
      where: { id: reminderId, pet: { owner_id: ownerId } },
    });
    if (!reminder) return 'not-found';

    const now = new Date();
    if (action === 'postpone') {
      const days = Number(daysValue ?? 7);
      if (!Number.isInteger(days) || days < 1 || days > 365) return 'invalid';
      await this.database.reminder.update({
        where: { id: reminder.id },
        data: { snoozed_until: new Date(now.getTime() + days * 86400000) },
      });
    } else if (action === 'complete') {
      await this.database.reminder.update({
        where: { id: reminder.id },
        data: { status: ReminderStatus.COMPLETED, completed_at: now, generated_action_at: now },
      });
    } else if (action === 'cancel') {
      await this.database.reminder.update({
        where: { id: reminder.id },
        data: { status: ReminderStatus.CANCELLED, cancelled_at: now },
      });
    } else {
      return 'invalid';
    }
    return 'ok';
  }

  async updatePreferences(ownerId: number, enabled: boolean, leadDays: number) {
    const owner = await this.database.owner.update({
      where: { id: ownerId },
      data: { notifications_enabled: enabled, reminder_lead_days: leadDays },
    });
    return { enabled: owner.notifications_enabled, leadDays: owner.reminder_lead_days };
  }
}
