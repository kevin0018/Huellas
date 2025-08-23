import type { AuthRepository } from '../domain/AuthRepository';
import type { LoginResponse, User } from '../domain/User';
import { AuthService } from './AuthService';

export class ApiAuthRepository implements AuthRepository {
  private readonly baseUrl: string;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    this.baseUrl = `${apiUrl}/auth`;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload = { email, password };
    
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      } catch {
        // Fallback based on status code
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status >= 500) {
          throw new Error('Server error');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }
    }

    return await response.json();
  }

  async logout(): Promise<void> {
    const token = AuthService.getToken();
    
    if (token) {
      try {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Failed to notify server of logout:', error);
      }
    }
    
    // Always clear local storage, even if server call fails
    AuthService.logout();
  }

  async updateProfile(token: string, profileData: {
    name: string;
    lastName: string;
    email: string;
  }): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    return await response.json();
  }

  async changePassword(token: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }
  }

  async toggleVolunteer(token: string, volunteerData?: {
    description: string;
  }): Promise<User> {
    const method = volunteerData ? 'POST' : 'DELETE';
    const url = `${this.baseUrl}/volunteer`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: volunteerData ? JSON.stringify(volunteerData) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to toggle volunteer status');
    }

    return await response.json();
  }
}
