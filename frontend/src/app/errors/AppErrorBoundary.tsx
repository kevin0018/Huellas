/* eslint-disable react-refresh/only-export-components -- React error boundaries must be class components. */
import { Component, type ReactNode } from 'react';
import { ViewLoadError } from '../routing/lazyView';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/hooks/hook';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  reloadRequired: boolean;
};

function AppErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { translate } = useTranslation();

  return (
    <main className="workspace-page grid min-h-dvh place-items-center">
      <section className="workspace-main max-w-xl text-center" role="alert">
        <Link
          to="/"
          className="mb-8 inline-flex min-h-11 items-center gap-2 font-[var(--font-display)] text-xl text-[var(--color-accent)] no-underline"
          aria-label={translate('brandHomeLabel')}
        >
          <img src="/media/logotipo.svg" alt="" className="h-11 w-11 object-contain" />
          Huellas
        </Link>
        <h1 className="workspace-header__title">{translate('unexpectedErrorTitle')}</h1>
        <p className="workspace-header__description mx-auto">
          {translate('unexpectedErrorDescription')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="ui-action ui-action--primary px-5 py-3" onClick={onRetry}>
            {translate('retry')}
          </button>
          <Link to="/" className="ui-action ui-action--secondary px-5 py-3 no-underline">
            {translate('backToHome')}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, reloadRequired: false };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return { hasError: true, reloadRequired: error instanceof ViewLoadError };
  }

  componentDidCatch() {
    console.error('[AppErrorBoundary] Unexpected render error');
  }

  private reset = () => {
    // React.lazy caches rejected imports; remounting alone cannot recover them.
    if (this.state.reloadRequired) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, reloadRequired: false });
  };

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback onRetry={this.reset} />;
    }

    return this.props.children;
  }
}
