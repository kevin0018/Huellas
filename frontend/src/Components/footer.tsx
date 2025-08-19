import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useTranslation } from '../i18n/hooks/hook';

const Footer: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <footer className="bg-neutral-100 dark:bg-neutral-800">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">
            {translate('appName')}
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;