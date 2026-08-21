/**
 * Responsive primary navigation.
 * Routes are filtered by the capabilities of the authenticated user.
 */

import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './theme/ThemeSwitcher';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useTranslation } from '../i18n/hooks/hook';
import { AuthService } from '../modules/auth/infra/AuthService';
import { Capability, hasCapability, type User } from '../modules/auth/domain/User';
import { authActions } from '../features/auth/authActions';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-3 py-2',
    'ui-hover-surface text-sm font-semibold no-underline outline-offset-2',
    'transition-[color,background-color] duration-[var(--duration-short)]',
    isActive
      ? 'ui-contrast-action bg-[var(--color-accent)]'
      : 'text-[var(--color-ink-soft)]',
  ].join(' ');

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'ui-hover-surface flex min-h-11 w-full items-center rounded-[var(--radius-control)] px-4 py-2 text-base font-semibold no-underline',
    'transition-[color,background-color] duration-[var(--duration-short)]',
    isActive
      ? 'ui-contrast-action bg-[var(--color-accent)]'
      : 'text-[var(--color-ink)]',
  ].join(' ');

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setUser(authenticated ? AuthService.getUser() : null);
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('auth-changed', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('auth-changed', checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authActions.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      AuthService.logout();
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setIsOpen(false);
      navigate('/login');
    }
  };

  const canManagePets = hasCapability(user, Capability.MANAGE_PETS);
  const canPublishVolunteerPosts = hasCapability(user, Capability.PUBLISH_VOLUNTEER_POSTS);

  const authenticatedLinks = (
    <>
      {canManagePets && <NavLink to="/user-home" className={navLinkClass}>{translate('home')}</NavLink>}
      {canPublishVolunteerPosts && <NavLink to="/volunteer-home" className={navLinkClass}>Voluntariado</NavLink>}
      <NavLink to="/volunteer-board" className={navLinkClass}>Buscar voluntarios</NavLink>
      <NavLink to="/chat" className={navLinkClass}>Mis chats</NavLink>
    </>
  );

  const publicLinks = (
    <>
      <NavLink to="/" end className={navLinkClass}>{translate('home')}</NavLink>
      <NavLink to="/about" className={navLinkClass}>{translate('aboutUs')}</NavLink>
      <NavLink to="/register" className={navLinkClass}>{translate('register')}</NavLink>
    </>
  );

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-50 w-full border-b border-[var(--color-rule)] bg-[var(--color-surface-raised)]/95 px-[var(--page-gutter)] shadow-[var(--shadow-nav)] backdrop-blur-sm"
    >
      <div className="mx-auto grid min-h-20 max-w-[var(--page-max)] grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[auto_1fr_auto]">
        <NavLink
          to={isLoggedIn && canManagePets ? '/user-home' : '/'}
          end={!isLoggedIn}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-control)] pr-2 font-[var(--font-display)] text-xl leading-none text-[var(--color-accent)] no-underline"
          aria-label="Huellas, ir al inicio"
        >
          <img src="/media/logotipo.svg" alt="" className="h-11 w-11 object-contain" />
          <span>Huellas</span>
        </NavLink>

        <div className="hidden items-center justify-center gap-1 lg:flex">
          {isLoggedIn ? authenticatedLinks : publicLinks}
        </div>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              <NavLink to="/user-profile" className={navLinkClass}>{translate('profile')}</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="ui-hover-surface inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition-[color,background-color] duration-[var(--duration-short)]"
              >
                {translate('logout')}
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>{translate('login')}</NavLink>
          )}
          <LanguageSwitcher className="[&>button]:!h-11 [&>button]:!w-11" />
          <ThemeSwitcher className="!h-11 !w-[4.5rem]" />
        </div>

        <div className="flex items-center justify-end gap-2 lg:hidden">
          <LanguageSwitcher className="[&>button]:!h-11 [&>button]:!w-11" />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="primary-navigation-mobile"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="ui-hover-surface inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-accent)] transition-[color,background-color] duration-[var(--duration-short)]"
          >
            {isOpen ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="primary-navigation-mobile" className="mx-auto max-w-[var(--page-max)] border-t border-[var(--color-rule)] py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {isLoggedIn ? (
              <>
                {canManagePets && <NavLink to="/user-home" className={mobileNavLinkClass}>{translate('home')}</NavLink>}
                {canPublishVolunteerPosts && <NavLink to="/volunteer-home" className={mobileNavLinkClass}>Voluntariado</NavLink>}
                <NavLink to="/volunteer-board" className={mobileNavLinkClass}>Buscar voluntarios</NavLink>
                <NavLink to="/chat" className={mobileNavLinkClass}>Mis chats</NavLink>
                <NavLink to="/user-profile" className={mobileNavLinkClass}>{translate('profile')}</NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ui-hover-surface flex min-h-11 w-full items-center rounded-[var(--radius-control)] px-4 py-2 text-left text-base font-semibold text-[var(--color-ink)] transition-[color,background-color] duration-[var(--duration-short)]"
                >
                  {translate('logout')}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" end className={mobileNavLinkClass}>{translate('home')}</NavLink>
                <NavLink to="/about" className={mobileNavLinkClass}>{translate('aboutUs')}</NavLink>
                <NavLink to="/register" className={mobileNavLinkClass}>{translate('register')}</NavLink>
                <NavLink to="/login" className={mobileNavLinkClass}>{translate('login')}</NavLink>
              </>
            )}
            <div className="mt-2 flex min-h-11 items-center justify-between border-t border-[var(--color-rule)] px-4 pt-3 text-sm font-semibold text-[var(--color-ink-soft)]">
              <span>Tema</span>
              <ThemeSwitcher className="!h-11 !w-[4.5rem]" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
