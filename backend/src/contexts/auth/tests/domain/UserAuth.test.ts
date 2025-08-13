import { describe, it, expect } from 'vitest';
import { UserAuth, UserType } from '../../domain/entities/UserAuth.js';

describe('UserAuth', () => {
  it('should create a UserAuth instance with owner type', () => {
    const user = new UserAuth(
      1,
      'Juan',
      'Pérez',
      'juan@example.com',
      'hashedPassword',
      UserType.OWNER
    );

    expect(user.id).toBe(1);
    expect(user.name).toBe('Juan');
    expect(user.lastName).toBe('Pérez');
    expect(user.email).toBe('juan@example.com');
    expect(user.password).toBe('hashedPassword');
    expect(user.type).toBe(UserType.OWNER);
  });

  it('should correctly identify owner type', () => {
    const owner = new UserAuth(1, 'Juan', 'Pérez', 'juan@example.com', 'pass', UserType.OWNER);
    
    expect(owner.isOwner()).toBe(true);
    expect(owner.isVolunteer()).toBe(false);
  });

  it('should correctly identify volunteer type', () => {
    const volunteer = new UserAuth(2, 'María', 'García', 'maria@example.com', 'pass', UserType.VOLUNTEER);
    
    expect(volunteer.isOwner()).toBe(false);
    expect(volunteer.isVolunteer()).toBe(true);
  });
});
