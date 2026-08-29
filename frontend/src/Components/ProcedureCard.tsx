import type { PetProcedure } from '../modules/pet/domain/PetProcedure';

interface ProcedureCardProps {
  compact?: boolean;
  emphasis?: boolean;
  procedure: PetProcedure;
  onEdit: (procedure: PetProcedure) => void;
}

const statusInfo = {
  DONE: { className: 'border-[var(--color-success)] text-[var(--color-success)]', label: 'Al día' },
  MISSING: { className: 'border-[var(--color-error)] text-[var(--color-error)]', label: 'Vencido' },
  UPCOMING: { className: 'border-[var(--color-warning)] text-[var(--color-warning)]', label: 'Próximo' },
} as const;

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function recurrenceLabel(days?: number | null) {
  if (!days) return 'Sin recurrencia definida';
  if (days === 365) return 'Cada año';
  if (days === 30) return 'Cada mes';
  if (days % 365 === 0) return `Cada ${days / 365} años`;
  if (days % 7 === 0) return `Cada ${days / 7} semanas`;
  return `Cada ${days} días`;
}

const ProcedureCard = ({ compact = false, emphasis = false, procedure, onEdit }: ProcedureCardProps) => {
  const status = statusInfo[procedure.status];
  const dueAt = formatDate(procedure.dueAt);
  const lastOccurredAt = formatDate(procedure.lastOccurredAt ?? procedure.checkupDate);
  const action = procedure.status === 'DONE' ? 'Editar registro' : 'Registrar realización';

  return (
    <article className={`grid min-w-0 gap-5 border-b border-[var(--color-rule)] py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start ${compact ? 'sm:py-5' : 'sm:py-7'}`}>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={`inline-flex min-h-8 shrink-0 items-center rounded-[var(--radius-pill)] border px-3 text-xs font-bold ${status.className}`}>
            {status.label}
          </span>
          <h3 className="min-w-0 break-words font-nunito text-xl font-bold tracking-normal">{procedure.name}</h3>
        </div>

        <p className="mt-3 max-w-[65ch] text-sm leading-6 text-[var(--color-ink-soft)]">{procedure.explanation}</p>
        {!compact && procedure.description && <p className="mt-2 max-w-[65ch] text-sm leading-6 text-[var(--color-muted)]">{procedure.description}</p>}

        <dl className="mt-5 grid gap-x-7 gap-y-3 text-sm sm:grid-cols-3">
          {dueAt && <div><dt className="font-bold text-[var(--color-muted)]">Fecha orientativa</dt><dd className="mt-1 tabular-nums"><time dateTime={procedure.dueAt ?? undefined}>{dueAt}</time></dd></div>}
          {lastOccurredAt && <div><dt className="font-bold text-[var(--color-muted)]">Último registro</dt><dd className="mt-1 tabular-nums"><time dateTime={procedure.lastOccurredAt ?? procedure.checkupDate}>{lastOccurredAt}</time></dd></div>}
          <div><dt className="font-bold text-[var(--color-muted)]">Pauta</dt><dd className="mt-1">{recurrenceLabel(procedure.recurrenceDays)}</dd></div>
          {!dueAt && !lastOccurredAt && procedure.age > 0 && <div><dt className="font-bold text-[var(--color-muted)]">Edad orientativa</dt><dd className="mt-1">Desde las {procedure.age} semanas</dd></div>}
        </dl>

        {procedure.checkupNotes && <p className="mt-4 max-w-[65ch] whitespace-pre-wrap break-words text-sm leading-6"><strong>Notas:</strong> {procedure.checkupNotes}</p>}

        <details className="mt-4 max-w-[65ch] text-sm leading-5 text-[var(--color-muted)]">
          <summary className="min-h-11 cursor-pointer select-none py-3 font-bold text-[var(--color-accent)] focus-visible:rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">Cómo se calcula</summary>
          <p className="pb-1">Fuente: {procedure.source} · versión {procedure.version} · región {procedure.region}. Esta orientación no sustituye la pauta de tu veterinario.</p>
        </details>
      </div>

      <button
        aria-label={`${action} de ${procedure.name}`}
        className={`ui-button w-full whitespace-nowrap sm:w-auto ${emphasis ? '' : 'ui-button--secondary'}`}
        onClick={() => onEdit(procedure)}
        type="button"
      >
        {action}
      </button>
    </article>
  );
};

export default ProcedureCard;
