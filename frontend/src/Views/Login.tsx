import type { TranslationKey } from '../i18n/dictionary';
import { ClientError } from '../shared/errors/ClientError';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { authActions } from '../features/auth/authActions';
import { Capability, hasCapability } from '../modules/auth/domain/User';
import type { ChangeEvent, FormEvent } from 'react';
import GoBackButton from '../Components/GoBackButton';
import { ApiError } from '../shared/api/apiClient';

function LoginContent() {
  const { translate } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const getErrorKey = (error: string): TranslationKey => {
    const errorMessage = error.toLowerCase();

    if (errorMessage.includes('invalid email or password') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('401')) {
      return 'invalidCredentials';
    }

    if (errorMessage.includes('network error') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection')) {
      return 'networkError';
    }

    if (errorMessage.includes('server error') ||
      errorMessage.includes('http 5')) {
      return 'serverError';
    }

    return 'invalidCredentials';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authActions.login(form.email, form.password);

      const returnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
      const defaultDestination = hasCapability(response.user, Capability.MANAGE_PETS) ? '/user-home' : '/volunteer-home';
      navigate(typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : defaultDestination, { replace: true });

    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('tooManyLoginAttempts');
      } else if (err instanceof ClientError) {
        setError(err.code === 'NETWORK' ? 'networkError' : 'invalidCredentials');
      } else if (err instanceof Error) {
        setError(getErrorKey(err.message));
      } else {
        setError('invalidCredentials');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for registration success parameter
    if (searchParams.get('registered') === 'true') {
      setShowSuccessToast(true);
      // Clean URL without page reload
      setSearchParams({});
      // Auto-hide toast after 4 seconds
      setTimeout(() => setShowSuccessToast(false), 4000);
    }
  }, [searchParams, setSearchParams]);
  return (
    <main className="form-page relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/media/bg_phone_userhome.png')] bg-repeat opacity-60 md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')]"
        aria-hidden="true"
      />

      <div className="form-page__content form-page__content--compact relative z-10">
        <div>
          <GoBackButton variant="outline" hideIfNoHistory className="ui-button ui-button--secondary" />
        </div>

        <header className="form-page__header">
          <h1 id="login-title" className="form-page__title">{translate('login')}</h1>
        </header>

        <div className="form-surface">
          <form className="form-stack" onSubmit={handleSubmit} aria-labelledby="login-title" aria-busy={loading}>
            <div className="form-field">
              <label htmlFor="login-email" className="form-label">{translate('email')}</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder={translate('email')}
                autoComplete="email"
                className="form-control"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="login-password" className="form-label">{translate('password')}</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder={translate('password')}
                autoComplete="current-password"
                className="form-control"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                required
              />
            </div>

            {error && (
              <div id="login-error" className="form-alert" role="alert">{error && translate(error)}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ui-button form-submit"
              aria-busy={loading}
            >
              {loading && <span className="ui-spinner" aria-hidden="true" />}
              <span aria-live="polite">{loading ? translate('loading') : translate('login')}</span>
            </button>
          </form>

          <div className="form-meta">
            <Link to="/reset-password" className="form-link">
              {translate('forgotPassword')}
            </Link>
            <div className="flex min-h-11 flex-wrap items-center gap-1">
              <span>{translate('dontHaveAccount')}</span>
              <Link to="/register" className="form-link register-link">
                {translate('register')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div
          className="fixed bottom-4 left-1/2 z-50 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-success)] bg-[var(--color-success)] px-6 py-3 text-[var(--color-success-ink)] shadow-[var(--shadow-card)]"
          role="status"
          aria-live="polite"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{translate('registerSuccess')}</span>
        </div>
      )}
    </main>
  );
}

export default function Login() {
  return (
    <>
      <NavBar />
      <LoginContent />
    </>
  );
};
