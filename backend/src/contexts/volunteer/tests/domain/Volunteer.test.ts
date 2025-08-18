import { describe, it, expect } from 'vitest';
import { Volunteer } from '../../domain/entities/Volunteer.js';
import { VolunteerId } from '../../domain/value-objects/VolunteerId.js';

describe('Volunteer entity', () => {
  it('should create a Volunteer with valid data using createWithHashedPassword', () => {
    const id = new VolunteerId(1);
    const volunteer = Volunteer.createWithHashedPassword(
      id, 
      'Jane', 
      'Smith', 
      'jane@example.com', 
      '$2b$10$hashedpasswordexample1234567890', // Simulated hashed password
      'I love helping animals and have veterinary experience'
    );
    
    expect(volunteer.id.getValue()).toBe(1);
    expect(volunteer.name).toBe('Jane');
    expect(volunteer.lastName).toBe('Smith');
    expect(volunteer.email).toBe('jane@example.com');
    expect(volunteer.password).toBe('$2b$10$hashedpasswordexample1234567890');
    expect(volunteer.description).toBe('I love helping animals and have veterinary experience');
  });

  it('should create a Volunteer with plain password', () => {
    const id = new VolunteerId(1);
    const volunteer = Volunteer.create(
      id, 
      'Jane', 
      'Smith', 
      'jane@example.com', 
      'plainPassword',
      'I love helping animals and have veterinary experience'
    );
    
    expect(volunteer.id.getValue()).toBe(1);
    expect(volunteer.name).toBe('Jane');
    expect(volunteer.lastName).toBe('Smith');
    expect(volunteer.email).toBe('jane@example.com');
    expect(volunteer.password).toBe('plainPassword');
    expect(volunteer.description).toBe('I love helping animals and have veterinary experience');
  });

  it('should validate required fields during creation', () => {
    const id = new VolunteerId(1);
    
    // Empty name
    expect(() => Volunteer.create(id, '', 'Smith', 'jane@example.com', 'password123', 'Description'))
      .toThrow('Name is required');
    
    // Empty last name
    expect(() => Volunteer.create(id, 'Jane', '', 'jane@example.com', 'password123', 'Description'))
      .toThrow('Last name is required');
    
    // Invalid email
    expect(() => Volunteer.create(id, 'Jane', 'Smith', 'invalid-email', 'password123', 'Description'))
      .toThrow('Invalid email format');
    
    // Short password
    expect(() => Volunteer.create(id, 'Jane', 'Smith', 'jane@example.com', '123', 'Description'))
      .toThrow('Password must be at least 8 characters long');
    
    // Empty description
    expect(() => Volunteer.create(id, 'Jane', 'Smith', 'jane@example.com', 'password123', ''))
      .toThrow('Description is required');
  });

  it('should normalize data during creation', () => {
    const id = new VolunteerId(1);
    const volunteer = Volunteer.create(
      id,
      '  Jane  ',
      '  Smith  ',
      '  JANE@EXAMPLE.COM  ',
      'password123',
      '  I love animals  '
    );
    
    expect(volunteer.name).toBe('Jane');
    expect(volunteer.lastName).toBe('Smith');
    expect(volunteer.email).toBe('jane@example.com');
    expect(volunteer.description).toBe('I love animals');
  });

  it('should correctly check deletion authorization', () => {
    const id = new VolunteerId(1);
    const volunteer = Volunteer.create(
      id,
      'Jane',
      'Smith',
      'jane@example.com',
      'password123',
      'I love animals'
    );
    
    // Should allow owner to delete
    expect(volunteer.canBeDeletedBy(1)).toBe(true);
    
    // Should not allow other users to delete
    expect(volunteer.canBeDeletedBy(2)).toBe(false);
  });
});
