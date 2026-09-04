import { procedureRecurrenceLabel } from '../features/pets/procedurePresentation';
import { localeByLanguage } from '../i18n/locale';
import { useTranslation } from '../i18n/hooks/hook';
import type { PetProcedure } from '../modules/pet/domain/PetProcedure';

interface ProcedureCardProps {
  compact?: boolean;
  emphasis?: boolean;
  procedure: PetProcedure;
  onEdit: (procedure: PetProcedure) => void;
}

const statusInfo = {
  DONE: { className: 'border-[var(--color-success)] text-[var(--color-success)]', label: 'planCurrent' },
  MISSING: { className: 'border-[var(--color-error)] text-[var(--color-error)]', label: 'procedureOverdue' },
  UPCOMING: { className: 'border-[var(--color-warning)] text-[var(--color-warning)]', label: 'procedureUpcoming' },
} as const;

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

const ProcedureCard = ({ compact = false, emphasis = false, procedure, onEdit }: ProcedureCardProps) => {
  const { translate, currentLanguage } = useTranslation();
  const status = statusInfo[procedure.status];
  const dueAt = formatDate(procedure.dueAt, localeByLanguage[currentLanguage]);
  const lastOccurredAt = formatDate(procedure.lastOccurredAt ?? procedure.checkupDate, localeByLanguage[currentLanguage]);
  const action = procedure.status === 'DONE' ? translate('editProcedureRecord') : translate('recordProcedure');

  return (
    <article className={`grid min-w-0 gap-5 border-b border-[var(--color-rule)] py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start ${compact ? 'sm:py-5' : 'sm:py-7'}`}>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={`inline-flex min-h-8 shrink-0 items-center rounded-[var(--radius-pill)] border px-3 text-xs font-bold ${status.className}`}>
            {translate(status.label)}
          </span>
          <h3 className="min-w-0 break-words font-nunito text-xl font-bold tracking-normal">{procedure.name}</h3>
        </div>

        <p className="mt-3 max-w-[65ch] text-sm leading-6 text-[var(--color-ink-soft)]">{procedure.explanation}</p>
        {!compact && procedure.description && <p className="mt-2 max-w-[65ch] text-sm leading-6 text-[var(--color-muted)]">{procedure.description}</p>}

        <dl className="mt-5 grid gap-x-7 gap-y-3 text-sm sm:grid-cols-3">
          {dueAt && <div><dt className="font-bold text-[var(--color-muted)]">{translate('estimatedDate')}</dt><dd className="mt-1 tabular-nums"><time dateTime={procedure.dueAt ?? undefined}>{dueAt}</time></dd></div>}
          {lastOccurredAt && <div><dt className="font-bold text-[var(--color-muted)]">{translate('lastRecord')}</dt><dd className="mt-1 tabular-nums"><time dateTime={procedure.lastOccurredAt ?? procedure.checkupDate}>{lastOccurredAt}</time></dd></div>}
          <div><dt className="font-bold text-[var(--color-muted)]">{translate('careSchedule')}</dt><dd className="mt-1">{procedureRecurrenceLabel(procedure.recurrenceDays, translate)}</dd></div>
          {!dueAt && !lastOccurredAt && procedure.age > 0 && <div><dt className="font-bold text-[var(--color-muted)]">{translate('estimatedAge')}</dt><dd className="mt-1">{translate(procedure.age === 1 ? 'fromAgeWeek' : 'fromAgeWeeks', { count: procedure.age })}</dd></div>}
        </dl>

        {procedure.checkupNotes && <p className="mt-4 max-w-[65ch] whitespace-pre-wrap break-words text-sm leading-6"><strong>{translate('healthNotes')}:</strong> {procedure.checkupNotes}</p>}

        <details className="mt-4 max-w-[65ch] text-sm leading-5 text-[var(--color-muted)]">
          <summary className="min-h-11 cursor-pointer select-none py-3 font-bold text-[var(--color-accent)] focus-visible:rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">{translate('procedureCalculation')}</summary>
          <p className="pb-1">{translate('procedureSource', { source: procedure.source, version: procedure.version, region: procedure.region })}</p>
        </details>
      </div>

      <button
        aria-label={translate('procedureActionName', { action, procedure: procedure.name })}
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
