/**
 * Barra de navegación responsive con menú hamburguesa.
 * Incluye ThemeSwitcher (claro/oscuro) y LanguageSwitcher.
*/

import React, { useState } from 'react';
import ThemeSwitcher from './theme/ThemeSwitcher';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useTranslation } from '../i18n/hooks/hook';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { translate } = useTranslation();
  const toggleMenu = (): void => setIsOpen(!isOpen);

  return (
    <nav className="bg-[#BCAAA4] text-white p-4 shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <a href="/">
          <img src="/media/logotipo.svg" alt="Logotipo-huellas" className="h-14 w-auto" />
        </a>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#inicio" className="hover:text-[--huellas-eggplant]">{translate('home')}</a>
          <a href="#servicios" className="hover:text-[--huellas-eggplant]">{translate('services')}</a>
          <a href="#nosotros" className="hover:text-[--huellas-eggplant]">{translate('aboutUs')}</a>
          <a href="#contacto" className="hover:text-[--huellas-eggplant]">{translate('contact')}</a>
          <LanguageSwitcher className="select-huellas" />
          <ThemeSwitcher />
        </div>

        {/* Mobile: Theme + Lang + Burger */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher className="select-huellas" />
          <ThemeSwitcher />
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
          <a href="#inicio" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('home')}</a>
          <a href="#servicios" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('services')}</a>
          <a href="#nosotros" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('aboutUs')}</a>
          <a href="#contacto" onClick={toggleMenu} className="hover:text-[--huellas-eggplant]">{translate('contact')}</a>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="select-huellas" />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;