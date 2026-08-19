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
      <div className="flex items-center justify-center gap-3 py-12 text-[#51344D] dark:text-[#FDF2DE]" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-current" aria-hidden="true" />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-800 dark:border-red-600 dark:bg-red-900 dark:text-red-100" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button className="mt-3 rounded-md border border-current px-3 py-1.5 text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800" onClick={() => void onRetry()} type="button">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm" role="status">
        <h2 className="text-xl font-semibold text-[#51344D]">{emptyTitle}</h2>
        {emptyDescription && <p className="mt-2">{emptyDescription}</p>}
      </div>
    );
  }

  return children;
}
