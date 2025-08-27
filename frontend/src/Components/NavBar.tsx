/**
 * Barra de navegación responsive con menú hamburguesa.
 * LanguageSwitcher visible en la barra (desktop + móvil topbar).
 * ThemeSwitcher solo dentro del menú móvil.
 * Navegación SPA con react-router-dom (Link).
*/

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './theme/ThemeSwitcher';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useTranslation } from '../i18n/hooks/hook';
import { AuthService } from '../modules/auth/infra/AuthService';
import { LogoutCommand } from '../modules/auth/application/commands/LogoutCommand';
import { LogoutCommandHandler } from '../modules/auth/application/commands/LogoutCommandHandler';
import { ApiAuthRepository } from '../modules/auth/infra/ApiAuthRepository';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { translate } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status on mount and listen for changes
    setIsLoggedIn(AuthService.isAuthenticated());
    
    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      setIsLoggedIn(AuthService.isAuthenticated());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleMenu = (): void => setIsOpen(!isOpen);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      const authRepository = new ApiAuthRepository();
      const logoutHandler = new LogoutCommandHandler(authRepository);
      const logoutCommand = new LogoutCommand();
      
      await logoutHandler.handle(logoutCommand);
      setIsLoggedIn(false);
      navigate('/login');
      closeMenu();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      AuthService.logout();
      setIsLoggedIn(false);
      navigate('/login');
      closeMenu();
    }
  };

  return (
    <nav className="bg-[#A89B9D] dark:bg-[#928d8e] text-white p-4 shadow-md w-full sticky top-0 z-50 rounded-xs 3xl:max-w-80%">
      <div className="container mx-auto flex justify-between items-center ">
        {/* Logo + brand */}
        <Link to="/" className="flex items-center text-eggplant text-xl text-[#51344D] 3xl:!text-[3rem]">
          <img src="/media/logotipo.svg" alt="Logotipo-huellas" className="h-14 w-auto" />
          Huellas
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-6 text-[#51344D]">
          {isLoggedIn ? (
            <>
              <Link to="/user-home" className="3xl:!text-[2rem]">{translate('home')}</Link>
              <Link to="/user-profile" className="3xl:!text-[2rem]">{translate('profile')}</Link>
              <Link to="/volunteer-home" className="3xl:!text-[2rem]">Voluntariado</Link>

              <Link to="/volunteer-board" className="3xl:!text-[2rem]">Buscar voluntarios</Link>
              <Link to="/volunteer-home" className="3xl:!text-[2rem]">Voluntariado</Link>

              <Link to="/volunteer-board" className="3xl:!text-[2rem]">Buscar voluntarios</Link>
              <button 
                onClick={handleLogout}
                className="3xl:!text-[2rem]"
              >
                {translate('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="3xl:!text-[2rem]">{translate('register')}</Link>
              <Link to="/login" className="3xl:!text-[2rem]">{translate('login')}</Link>
              <Link to="/about" className="3xl:!text-[2rem]">{translate('aboutUs')}</Link>
            </>
          )}
          <LanguageSwitcher className="select-huellas" />
          <ThemeSwitcher />
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
          {isLoggedIn ? (
            <>
              <Link to="/user-home" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('home')}</Link>
              <Link to="/user-profile" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('profile')}</Link>
              <Link to="/volunteer-home" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">Voluntariado</Link>
              <Link to="/volunteer-board" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">Buscar voluntarios</Link>
              <Link to="/volunteer-home" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">Voluntariado</Link>
              <Link to="/volunteer-board" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">Buscar voluntarios</Link>
              <button
                onClick={handleLogout}
                className="hover:text-[--huellas-eggplant]"
              >
                {translate('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('home')}</Link>
              <Link to="/login" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('login')}</Link>
              <Link to="/register" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('register')}</Link>
            </>
          )}
          <Link to="/about" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('aboutUs')}</Link>
          <Link to="/contact" onClick={closeMenu} className="hover:text-[--huellas-eggplant]">{translate('contact')}</Link>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};