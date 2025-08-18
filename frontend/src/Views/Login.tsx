/**
 * Login page.
 * Wraps content in providers; `useTranslation` used inside child to respect context.
 */

import React from 'react';
import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

const LoginContent: React.FC = () => {
  const { translate } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF2DE] dark:bg-[#51344D]">
      <h1 className="h1 font-caprasimo mb-4">{translate('login')}</h1>
      <form className="flex flex-col space-y-4">
        <input type="email" placeholder="Email" className="input" />
        <input type="password" placeholder="Password" className="input" />
        <button type="submit" className="btn">{translate('login')}</button>
      </form>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavBar />
        <LoginContent />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default Login;