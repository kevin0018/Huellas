import { PetProcedureStatus } from '../../../types/procedure.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculatePreventiveStatus(input: {
  birthDate: Date;
  startsAtAgeWeeks: number;
  recurrenceDays: number | null;
  lastOccurredAt: Date | null;
  windowBeforeDays: number;
  windowAfterDays: number;
  now: Date;
}): { status: PetProcedureStatus; dueAt: Date | null; explanation: string } {
  if (input.lastOccurredAt && input.recurrenceDays === null) {
    return { status: PetProcedureStatus.DONE, dueAt: null, explanation: 'Registrado en el historial; no tiene recurrencia configurada.' };
  }
  const dueAt = input.lastOccurredAt && input.recurrenceDays
    ? new Date(input.lastOccurredAt.getTime() + input.recurrenceDays * DAY_MS)
    : new Date(input.birthDate.getTime() + input.startsAtAgeWeeks * 7 * DAY_MS);
  const upcomingAt = dueAt.getTime() - input.windowBeforeDays * DAY_MS;
  const overdueAt = dueAt.getTime() + input.windowAfterDays * DAY_MS;
  if (input.now.getTime() > overdueAt) return { status: PetProcedureStatus.MISSING, dueAt, explanation: `Venció el ${dueAt.toLocaleDateString('es-ES')}.` };
  if (input.now.getTime() >= upcomingAt) return { status: PetProcedureStatus.UPCOMING, dueAt, explanation: `Está dentro de su ventana; fecha orientativa ${dueAt.toLocaleDateString('es-ES')}.` };
  return {
    status: input.lastOccurredAt ? PetProcedureStatus.DONE : PetProcedureStatus.UPCOMING,
    dueAt,
    explanation: input.lastOccurredAt
      ? `Último registro vigente; próxima fecha orientativa ${dueAt.toLocaleDateString('es-ES')}.`
      : `Programado por edad para el ${dueAt.toLocaleDateString('es-ES')}.`,
  };
}
