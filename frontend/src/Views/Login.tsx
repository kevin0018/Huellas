import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { LoginCommand } from '../modules/auth/application/commands/LoginCommand';
import { LoginCommandHandler } from '../modules/auth/application/commands/LoginCommandHandler';
import { ApiAuthRepository } from '../modules/auth/infra/ApiAuthRepository';
import { AuthService } from '../modules/auth/infra/AuthService';
import type { ChangeEvent, FormEvent } from 'react';
import GoBackButton from '../Components/GoBackButton';

function LoginContent() {
  const { translate } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getErrorMessage = (error: string): string => {
    const errorMessage = error.toLowerCase();

    if (errorMessage.includes('invalid email or password') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('401')) {
      return translate('invalidCredentials');
    }

    if (errorMessage.includes('network error') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection')) {
      return translate('networkError');
    }

    if (errorMessage.includes('server error') ||
      errorMessage.includes('http 5')) {
      return translate('serverError');
    }

    return translate('invalidCredentials');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const repo = new ApiAuthRepository();
      const handler = new LoginCommandHandler(repo);
      const command = new LoginCommand(form.email, form.password);

      const response = await handler.execute(command);

      // Save authentication data
      AuthService.saveAuth(response.token, response.user);

      // Redirect based on user type
      if (response.user.type === 'volunteer') {
        navigate('/volunteer-home');
      } else {
        navigate('/user-home');
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(getErrorMessage(err.message));
      } else {
        setError(translate('invalidCredentials'));
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
    <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Responsive background with dogs */}
      <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

      <div className="w-full text-left max-w-6xl xl:max-w-6xl 3xl:max-w-[1600px]">
        <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-lg py-4">
        <h1 className="h1 font-caprasimo mb-4 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">{translate('login')}</h1>
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg p-6 sm:p-8 bg-white/90 dark:bg-[#51344D]/90 rounded-xl shadow-lg border border-[#51344D] flex flex-col gap-4 mt-0">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-nunito text-base text-eggplant text-left">{translate('email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder={translate('email')}
                className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-nunito text-base text-eggplant text-left">{translate('password')}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder={translate('password')}
                className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn font-bold py-2 rounded-md mt-2 transition-colors w-full disabled:opacity-50"
              style={{ background: '#51344D', color: '#fff' }}
            >
              {loading ? translate('loading') || 'Cargando...' : translate('login')}
            </button>
          </form>
          <div className="mt-2 text-sm flex flex-col gap-1 items-center dark:text-[#FDF2DE]">
            <Link to="/reset-password" className="text-[#51344D] underline hover:opacity-80 focus:underline focus:outline-none dark:text-[#FDF2DE]">
              {translate('forgotPassword')}
            </Link>
            <div className="flex flex-row gap-1 items-center">
              <span>{translate('dontHaveAccount')}</span>
              <Link
                to="/register"
                className="register-link text-[#51344D] underline hover:opacity-80 focus:underline focus:outline-none dark:text-[#FDF2DE]"
              >
                {translate('register')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{translate('registerSuccess')}</span>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavBar />
        <LoginContent />
      </ThemeProvider>
    </LanguageProvider>
  );
};