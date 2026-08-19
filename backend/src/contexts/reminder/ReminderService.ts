import { AppointmentStatus, ReminderSource, ReminderStatus, type PrismaClient } from '@prisma/client';
import { calculatePreventiveStatus } from '../procedure/app/PreventivePlanCalculator.js';

export class ReminderService {
  constructor(private readonly database: PrismaClient) {}

  async syncOwner(ownerId: number, now = new Date()): Promise<void> {
    const pets = await this.database.pet.findMany({
      where: { owner_id: ownerId },
      include: { appointments: true, health_events: { orderBy: { occurred_at: 'desc' } } },
    });
    const activeAppointmentKeys = new Set<string>();
    for (const pet of pets) {
      for (const appointment of pet.appointments.filter((item) => item.status === AppointmentStatus.scheduled)) {
        const sourceKey = `appointment:${appointment.id}`;
        activeAppointmentKeys.add(sourceKey);
        await this.database.reminder.upsert({
          where: { source_key: sourceKey },
          update: {},
          create: { pet_id: pet.id, source: ReminderSource.APPOINTMENT, source_key: sourceKey, title: `Cita: ${appointment.reason}`, due_at: appointment.date },
        });
      }

      const rules = await this.database.procedureSchedule.findMany({ where: { animal_type: pet.type } });
      for (const rule of rules) {
        const latest = pet.health_events.find((event) => event.type === rule.procedure_type && event.title.toLocaleLowerCase('es') === rule.procedure_name.toLocaleLowerCase('es')) ?? null;
        const calculated = calculatePreventiveStatus({
          birthDate: pet.birth_date, startsAtAgeWeeks: rule.recommended_vaccines_age,
          recurrenceDays: rule.recurrence_days, lastOccurredAt: latest?.occurred_at ?? null,
          windowBeforeDays: rule.due_window_before_days, windowAfterDays: rule.due_window_after_days, now,
        });
        if (!calculated.dueAt) continue;
        const sourceKey = `preventive:${pet.id}:${rule.id}:${calculated.dueAt.toISOString().slice(0, 10)}`;
        await this.database.reminder.upsert({
          where: { source_key: sourceKey }, update: {},
          create: { pet_id: pet.id, source: ReminderSource.PREVENTIVE_PLAN, source_key: sourceKey, preventive_procedure_id: rule.id, title: rule.procedure_name, due_at: calculated.dueAt },
        });
      }
    }
    const appointmentReminders = await this.database.reminder.findMany({ where: { pet: { owner_id: ownerId }, source: ReminderSource.APPOINTMENT, status: ReminderStatus.PENDING } });
    const obsolete = appointmentReminders.filter((reminder) => !activeAppointmentKeys.has(reminder.source_key)).map((reminder) => reminder.id);
    if (obsolete.length) await this.database.reminder.updateMany({ where: { id: { in: obsolete } }, data: { status: ReminderStatus.CANCELLED, cancelled_at: now } });
  }

  async completePreventive(petId: number, type: string, title: string, now = new Date()): Promise<void> {
    const pending = await this.database.reminder.findMany({
      where: { pet_id: petId, status: ReminderStatus.PENDING, source: ReminderSource.PREVENTIVE_PLAN },
      select: { preventive_procedure_id: true },
    });
    const rules = await this.database.procedureSchedule.findMany({
      where: { id: { in: pending.flatMap((item) => item.preventive_procedure_id ?? []) } },
    });
    const matchingIds = rules.filter((rule) => rule.procedure_type === type && rule.procedure_name.toLocaleLowerCase('es') === title.toLocaleLowerCase('es')).map((rule) => rule.id);
    if (matchingIds.length) {
      await this.database.reminder.updateMany({
        where: { pet_id: petId, preventive_procedure_id: { in: matchingIds }, status: ReminderStatus.PENDING },
        data: { status: ReminderStatus.COMPLETED, completed_at: now, generated_action_at: now },
      });
    }
  }
}
