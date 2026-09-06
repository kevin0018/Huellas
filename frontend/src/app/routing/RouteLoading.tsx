import { useTranslation } from '../../i18n/hooks/hook';

export default function RouteLoading() {
  const { translate } = useTranslation();

  return (
    <main className="ui-page min-h-screen grid place-items-center" role="status" aria-live="polite">
      <p>{translate('loading')}</p>
    </main>
  );
}
