import { AppointmentStatus, ReminderSource, ReminderStatus } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import { calculatePreventiveStatus } from '../procedure/app/PreventivePlanCalculator.js';

export async function syncOwnerReminders(ownerId: number, now = new Date()): Promise<void> {
  const pets = await prisma.pet.findMany({
    where: { owner_id: ownerId },
    include: { appointments: true, health_events: { orderBy: { occurred_at: 'desc' } } },
  });
  const activeAppointmentKeys = new Set<string>();
  for (const pet of pets) {
    for (const appointment of pet.appointments.filter((item) => item.status === AppointmentStatus.scheduled)) {
      const sourceKey = `appointment:${appointment.id}`;
      activeAppointmentKeys.add(sourceKey);
      await prisma.reminder.upsert({
        where: { source_key: sourceKey },
        update: {},
        create: { pet_id: pet.id, source: ReminderSource.APPOINTMENT, source_key: sourceKey, title: `Cita: ${appointment.reason}`, due_at: appointment.date },
      });
    }

    const rules = await prisma.procedureSchedule.findMany({ where: { animal_type: pet.type } });
    for (const rule of rules) {
      const latest = pet.health_events.find((event) => event.type === rule.procedure_type && event.title.toLocaleLowerCase('es') === rule.procedure_name.toLocaleLowerCase('es')) ?? null;
      const calculated = calculatePreventiveStatus({
        birthDate: pet.birth_date, startsAtAgeWeeks: rule.recommended_vaccines_age,
        recurrenceDays: rule.recurrence_days, lastOccurredAt: latest?.occurred_at ?? null,
        windowBeforeDays: rule.due_window_before_days, windowAfterDays: rule.due_window_after_days, now,
      });
      if (!calculated.dueAt) continue;
      const sourceKey = `preventive:${pet.id}:${rule.id}:${calculated.dueAt.toISOString().slice(0, 10)}`;
      await prisma.reminder.upsert({
        where: { source_key: sourceKey }, update: {},
        create: { pet_id: pet.id, source: ReminderSource.PREVENTIVE_PLAN, source_key: sourceKey, preventive_procedure_id: rule.id, title: rule.procedure_name, due_at: calculated.dueAt },
      });
    }
  }
  const appointmentReminders = await prisma.reminder.findMany({ where: { pet: { owner_id: ownerId }, source: ReminderSource.APPOINTMENT, status: ReminderStatus.PENDING } });
  const obsolete = appointmentReminders.filter((reminder) => !activeAppointmentKeys.has(reminder.source_key)).map((reminder) => reminder.id);
  if (obsolete.length) await prisma.reminder.updateMany({ where: { id: { in: obsolete } }, data: { status: ReminderStatus.CANCELLED, cancelled_at: now } });
}

export async function completePreventiveReminders(petId: number, type: string, title: string, now = new Date()): Promise<void> {
  const rules = await prisma.procedureSchedule.findMany({ where: { id: { in: (await prisma.reminder.findMany({ where: { pet_id: petId, status: ReminderStatus.PENDING, source: ReminderSource.PREVENTIVE_PLAN }, select: { preventive_procedure_id: true } })).flatMap((item) => item.preventive_procedure_id ?? []) } } });
  const matchingIds = rules.filter((rule) => rule.procedure_type === type && rule.procedure_name.toLocaleLowerCase('es') === title.toLocaleLowerCase('es')).map((rule) => rule.id);
  if (matchingIds.length) await prisma.reminder.updateMany({ where: { pet_id: petId, preventive_procedure_id: { in: matchingIds }, status: ReminderStatus.PENDING }, data: { status: ReminderStatus.COMPLETED, completed_at: now, generated_action_at: now } });
}
