import React from 'react';
import type { Appointment, AppointmentStatus } from '../modules/appointment/domain/Appointment.js';
import type { Pet } from '../modules/pet/domain/Pet.js';
import { getAppointmentReasonLabel, getAppointmentStatusLabel } from '../modules/appointment/domain/Appointment.js';

interface AppointmentCardProps {
  appointment: Appointment;
  pet?: Pet;
  emphasis?: boolean;
  actionsDisabled?: boolean;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: number) => void;
}

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: 'border-[var(--color-accent)] text-[var(--color-accent)]',
  completed: 'border-[var(--color-success)] text-[var(--color-success)]',
  cancelled: 'border-[var(--color-error)] text-[var(--color-error)]',
  no_show: 'border-[var(--color-warning)] text-[var(--color-warning)]',
};

function EditIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  pet,
  emphasis = false,
  actionsDisabled = false,
  onEdit,
  onDelete,
}) => {
  const date = new Date(appointment.date);
  const petName = pet?.name ?? `Mascota ${appointment.petId}`;
  const reasonLabel = getAppointmentReasonLabel(appointment.reason);
  const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
  const monthAndYear = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <article
      aria-label={`${reasonLabel} de ${petName}`}
      className={`flex min-w-0 flex-col gap-4 border-b border-[var(--color-rule)] p-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${emphasis ? 'bg-[var(--color-paper-2)]' : 'bg-[var(--color-surface-raised)]'}`}
    >
      <time className="flex shrink-0 items-baseline gap-2 tabular-nums sm:w-28 sm:flex-col sm:items-start sm:gap-0" dateTime={appointment.date}>
        <span className="text-2xl font-bold leading-none text-[var(--color-ink)]">{day}</span>
        <span className="text-sm font-semibold capitalize text-[var(--color-ink-soft)]">{monthAndYear}</span>
        <span className="text-sm font-bold text-[var(--color-accent)]">{time}</span>
      </time>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-nunito text-lg font-bold tracking-normal text-[var(--color-ink)]">{petName}</h3>
          {emphasis && (
            <span className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-2.5 py-1 text-xs font-bold text-[var(--color-accent-ink)]">
              Siguiente cita
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[var(--color-ink-soft)]">{reasonLabel}</span>
          <span aria-hidden="true" className="text-[var(--color-rule-strong)]">·</span>
          <span className={`rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs font-bold ${statusStyles[appointment.status]}`}>
            {getAppointmentStatusLabel(appointment.status)}
          </span>
        </div>

        {appointment.notes && (
          <p className="mt-2 max-w-[65ch] text-sm text-[var(--color-ink-soft)]">{appointment.notes}</p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
          {onEdit && (
            <button
              aria-label={`Editar cita de ${petName}`}
              className="ui-hover-surface inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-accent)] disabled:cursor-wait"
              disabled={actionsDisabled}
              onClick={() => onEdit(appointment)}
              title="Editar cita"
              type="button"
            >
              <EditIcon />
            </button>
          )}
          {onDelete && (
            <button
              aria-label={`Eliminar cita de ${petName}`}
              className="ui-hover-surface inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-error)] disabled:cursor-wait"
              disabled={actionsDisabled}
              onClick={() => onDelete(appointment.id)}
              title="Eliminar cita"
              type="button"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default AppointmentCard;
