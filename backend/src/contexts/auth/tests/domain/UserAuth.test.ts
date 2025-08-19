import { describe, it, expect } from 'vitest';
import { UserAuth, UserType } from '../../domain/entities/UserAuth.js';

describe('UserAuth', () => {
  it('should create a UserAuth instance with owner type using factory method', () => {
    const user = UserAuth.create(
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
    const owner = UserAuth.create(1, 'Juan', 'Pérez', 'juan@example.com', 'password123', UserType.OWNER);
    
    expect(owner.isOwner()).toBe(true);
    expect(owner.isVolunteer()).toBe(false);
  });

  it('should correctly identify volunteer type', () => {
    const volunteer = UserAuth.create(2, 'María', 'García', 'maria@example.com', 'password123', UserType.VOLUNTEER);
    
    expect(volunteer.isOwner()).toBe(false);
    expect(volunteer.isVolunteer()).toBe(true);
  });
});
