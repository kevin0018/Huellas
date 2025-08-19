import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';

const Footer: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <footer className="bg-[#A89B9D] text-white p-4 shadow-md w-full sticky top-0 z-50 rounded-xs">
      <div className="container mx-auto py-4 flex flex-col justify-center items-center md:flex-row md:justify-between">
        <div className="flex justify-center space-x-4 py-1.5">
          <img src="/media/sm/facebook.png" alt="facebook" className="w-6 h-6" />
          <img src="/media/sm/instagram.png" alt="instagram" className="w-6 h-6" />
          <img src="/media/sm/linkedin.png" alt="linkedin" className="w-6 h-6" />
        </div>
        <div className="flex flex-row items-center space-x-4 py-1.5">
          <Link to="/login" className="text-sm hover-eggplant">{translate('login')}</Link>
          <Link to="/register" className="text-sm hover-eggplant">{translate('register')}</Link>
          <Link to="/about" className="text-sm hover-eggplant">{translate('aboutUs')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;