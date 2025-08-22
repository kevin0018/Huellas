import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

function LoginContent() {
  const { translate } = useTranslation();
  return (
  <div className="flex flex-col items-center background-primary px-2 sm:px-0 overflow-hidden min-h-screen">
      {/* Responsive background with dogs */}
  <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

      {/* Content overlay */}
  <div className="relative z-10 w-full flex flex-col items-center pt-8 pb-4">
        <h1 className="h1 font-caprasimo mb-2 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">{translate('login')}</h1>
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg p-6 sm:p-8 bg-white/90 dark:bg-[#51344D]/90 rounded-xl shadow-lg border border-[#51344D] flex flex-col gap-4 mt-0">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-nunito text-base text-eggplant text-left">{translate('email')}</label>
              <input type="email" placeholder={translate('email')} className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-nunito text-base text-eggplant text-left">{translate('password')}</label>
              <input type="password" placeholder={translate('password')} className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white" />
            </div>
            <button type="submit" className="btn font-bold py-2 rounded-md mt-2 transition-colors w-full"
              style={{ background: '#51344D', color: '#fff' }}
            >
              {translate('login')}
            </button>
          </form>
          <div className="mt-2 text-sm flex flex-col gap-1 items-center dark:text-[#FDF2DE]">
            <a href="/reset-password" className="text-[#51344D] underline hover:opacity-80 focus:underline focus:outline-none dark:text-[#FDF2DE]">
              {translate('forgotPassword')}
            </a>
            <div className="flex flex-row gap-1 items-center">
              <span>{translate('dontHaveAccount')}</span>
              <a
                href="/register"
                className="register-link text-[#51344D] underline hover:opacity-80 focus:underline focus:outline-none dark:text-[#FDF2DE]"
              >
                {translate('register')}
              </a>
            </div>
          </div>
        </div>
      </div>
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