import React from 'react';
import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

const Register: React.FC = () => {
  const { translate } = useTranslation();
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavBar />
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF2DE] dark:bg-[#51344D]">
            <h1 className="h1 font-caprasimo mb-4">{translate('register')}</h1>
          </div>
        <Footer />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default Register;
