import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { User } from '../../modules/auth/domain/User';
import { AuthService } from '../../modules/auth/infra/AuthService';
import { apiClient } from '../../shared/api/apiClient';

type ProfileResponse = { user: User };

export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');

  useEffect(() => {
    let active = true;
    const token = AuthService.getToken();

    if (!token) {
      setStatus('anonymous');
      return () => { active = false; };
    }

    apiClient.get<ProfileResponse>('/auth/profile')
      .then(({ user }) => {
        AuthService.saveAuth(token, user);
        if (active) setStatus('authenticated');
      })
      .catch(() => {
        AuthService.logout();
        if (active) setStatus('anonymous');
      });

    return () => { active = false; };
  }, []);

  if (status === 'checking') {
    return (
      <main className="min-h-screen grid place-items-center bg-[#FDF2DE] dark:bg-[#51344D]" aria-live="polite">
        <p className="text-[#51344D] dark:text-[#FDF2DE]">Comprobando sesión…</p>
      </main>
    );
  }

  if (status === 'anonymous') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
