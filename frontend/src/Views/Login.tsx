import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

function LoginContent() {
  const { translate } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen background-primary">
      <h1 className="h1 font-caprasimo mb-4">{translate('login')}</h1>
      <div className='max-w-md p-6 bg-white rounded-lg shadow-md border-[#51344D] border-2'>
        <form className="flex flex-col space-y-4">
          <label htmlFor="email" className='font-nunito justify-self-start'>{translate("email")}</label>
          <input type="email" placeholder={translate("email")} className="input" />
          <label htmlFor="password" className='font-nunito justify-self-start'>{translate("password")}</label>
          <input type="password" placeholder={translate("password")} className="input" />
          <button type="submit" className="btn">{translate('login')}</button>
        </form>
        <div className="mt-4 text-sm">
          <span className='display block'>
            <a href="/reset-password" className="text-eggplant underline hover:opacity-80 focus:underline focus:outline-none ml-1">
              {translate('forgotPassword')}
            </a>
          </span>
          <span>{translate('dontHaveAccount')} </span>
          <a
            href="/register"
            className="register-link text-eggplant underline hover:opacity-80 focus:underline focus:outline-none"
          >
            {translate('register')}
          </a>
        </div>
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