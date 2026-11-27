import { useEffect, useState } from 'react';
import { AuthService } from '../../modules/auth/infra/AuthService';

function readUser() {
  return AuthService.isAuthenticated() ? AuthService.getUser() : null;
}

export function useSessionUser() {
  const [user, setUser] = useState(readUser);
  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    sync();
    return () => {
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return user;
}
