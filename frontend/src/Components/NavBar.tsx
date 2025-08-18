/**
 * Barra de navegación responsive con menú hamburguesa.
 * LanguageSwitcher visible en la barra (desktop + móvil topbar).
 * ThemeSwitcher solo dentro del menú móvil.
 * Navegación SPA con react-router-dom (Link).
*/

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './theme/ThemeSwitcher';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useTranslation } from '../i18n/hooks/hook';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { translate } = useTranslation();
  const toggleMenu = (): void => setIsOpen(!isOpen);

  return (
    <nav className="bg-[#A89B9D] dark:bg-[#A89B9D] text-white p-4 shadow-md w-full sticky top-0 z-50 rounded-xs">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo + brand */}
        <Link to="/" className="flex items-center text-eggplant text-xl">
          <img src="/media/logotipo.svg" alt="Logotipo-huellas" className="h-14 w-auto" />
          <p className="ml-2">Huellas</p>
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover-eggplant">{translate('home')}</Link>
          <Link to="/login" className="hover-eggplant">{translate('login')}</Link>
          <Link to="/about" className="hover-eggplant">{translate('aboutUs')}</Link>
          <Link to="/contact" className="hover-eggplant">{translate('contact')}</Link>
          <LanguageSwitcher className="select-huellas" />
          {/* ThemeSwitcher intencionalmente no se muestra en desktop */}
        </div>

        {/* Mobile topbar (LanguageSwitcher + burger) */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher className="select-huellas" />
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="text-[--huellas-eggplant]"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col items-center space-y-4 pt-4 pb-2">
          <Link to="/" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('home')}</Link>
          <Link to="/login" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('login')}</Link>
          <Link to="/about" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('aboutUs')}</Link>
          <Link to="/contact" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('contact')}</Link>
          <div className="flex items-center gap-3">
            {/* LanguageSwitcher intencionalmente no se muestra en el menú móvil */}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;