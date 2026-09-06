import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';

export default function Footer() {
  const { translate } = useTranslation();

  return (
    <footer className="mt-auto w-full border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)]">
      <div className="mx-auto flex w-full max-w-[var(--page-max)] flex-col items-start gap-3 px-[var(--page-gutter)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center font-[var(--font-display)] text-lg no-underline"
        >
          {translate('huellas')}
        </Link>

        <nav aria-label={`${translate('huellas')} · ${translate('aboutUs')}`}>
          <Link
            to="/about"
            className="ui-hover-accent inline-flex min-h-11 items-center font-semibold text-[var(--color-accent)] underline decoration-[var(--color-rule-strong)]"
          >
            {translate('aboutUs')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
