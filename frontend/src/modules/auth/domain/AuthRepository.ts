import type { LoginResponse } from '../domain/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
}
