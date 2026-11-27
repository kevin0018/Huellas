import { useTranslation } from '../../i18n/hooks/hook';

export default function RouteLoading() {
  const { translate } = useTranslation();

  return (
    <main className="ui-page grid min-h-[calc(100dvh-var(--nav-height))] place-items-center" role="status" aria-live="polite">
      <p>{translate('loading')}</p>
    </main>
  );
}
