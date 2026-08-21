import type { ReactNode } from 'react';

type AsyncContentProps = {
  loading: boolean;
  error?: string | null;
  empty: boolean;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void | Promise<void>;
  children: ReactNode;
};

export function AsyncContent({
  loading,
  error,
  empty,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: AsyncContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-[var(--color-ink)]" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-current" aria-hidden="true" />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-[var(--radius-control)] border border-[var(--color-error)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-error)]" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button className="ui-hover-surface mt-3 min-h-11 rounded-[var(--radius-control)] border border-current px-3 py-2 text-sm font-semibold" onClick={() => void onRetry()} type="button">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-rule-strong)] p-5 text-[var(--color-ink-soft)]" role="status">
        <p className="font-[var(--font-display)] text-xl leading-tight text-[var(--color-ink)]">{emptyTitle}</p>
        {emptyDescription && <p className="mt-2 text-sm">{emptyDescription}</p>}
      </div>
    );
  }

  return children;
}
