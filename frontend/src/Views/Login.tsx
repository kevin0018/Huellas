import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

function LoginContent() {
  const { translate } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen background-primary">
      <h1 className="h1 font-caprasimo mb-4">{translate('login')}</h1>
      <form className="flex flex-col space-y-4">
        <input type="email" placeholder="Email" className="input" />
        <input type="password" placeholder="Password" className="input" />
        <button type="submit" className="btn">{translate('login')}</button>
      </form>
      <div className="mt-4 text-sm">
        <span>{translate('dontHaveAccount')} </span>
        <a
          href="/register"
          className="register-link text-eggplant underline hover:opacity-80 focus:underline focus:outline-none"
        >
          {translate('register')}
        </a>
      </div>
    </div>
  );
};

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