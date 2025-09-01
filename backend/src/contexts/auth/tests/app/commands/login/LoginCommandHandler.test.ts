import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { LoginCommandHandler } from '../../../../app/commands/login/LoginCommandHandler.js';
import { LoginCommand } from '../../../../app/commands/login/LoginCommand.js';
import { MemoryAuthRepository } from '../../../../infra/repositories/MemoryAuthRepository.js';
import { UserAuth, UserType } from '../../../../domain/entities/UserAuth.js';
import { GetCurrentProfileQueryHandler } from '../../../../app/queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';

describe('LoginCommandHandler', () => {
  let authRepository: MemoryAuthRepository;
  let handler: LoginCommandHandler;
  let mockGetCurrentProfileHandler: GetCurrentProfileQueryHandler;
  let originalJwtSecret: string | undefined;

  beforeAll(() => {
    // Set JWT_SECRET for testing
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(() => {
    // Restore original JWT_SECRET
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  beforeEach(async () => {
    authRepository = new MemoryAuthRepository();
    
    // Create mock for GetCurrentProfileQueryHandler
    mockGetCurrentProfileHandler = {
      handle: vi.fn().mockImplementation((query) => {
        // Return a mock profile based on the user ID
        if (query.userId === 1) {
          return Promise.resolve({
            id: 1,
            name: 'Juan',
            lastName: 'Pérez',
            email: 'owner@example.com',
            type: UserType.OWNER
          });
        } else if (query.userId === 2) {
          return Promise.resolve({
            id: 2,
            name: 'María',
            lastName: 'García',
            email: 'volunteer@example.com',
            type: UserType.VOLUNTEER,
            description: 'Volunteer description'
          });
        }
        throw new Error('User not found');
      })
    } as any;
    
    handler = new LoginCommandHandler(authRepository, mockGetCurrentProfileHandler);
    
    // Create test users with hashed passwords using factory method
    const hashedPassword = await bcrypt.hash('correctPassword123', 12);
    
    const ownerUser = UserAuth.create(
      1,
      'Juan',
      'Pérez',
      'owner@example.com',
      hashedPassword,
      UserType.OWNER
    );
    
    const volunteerUser = UserAuth.create(
      2,
      'María',
      'García',
      'volunteer@example.com',
      hashedPassword,
      UserType.VOLUNTEER
    );
    
    await authRepository.save(ownerUser);
    await authRepository.save(volunteerUser);
  });

  it('should login successfully with valid owner credentials', async () => {
    const command = new LoginCommand('owner@example.com', 'correctPassword123');
    
    const result = await handler.execute(command);
    
    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(10);
    expect(result.user).toEqual({
      id: 1,
      name: 'Juan',
      lastName: 'Pérez',
      email: 'owner@example.com',
      type: UserType.OWNER
    });
  });

  it('should login successfully with valid volunteer credentials', async () => {
    const command = new LoginCommand('volunteer@example.com', 'correctPassword123');
    
    const result = await handler.execute(command);
    
    expect(result.token).toBeDefined();
    expect(result.user).toEqual({
      id: 2,
      name: 'María',
      lastName: 'García',
      email: 'volunteer@example.com',
      type: UserType.VOLUNTEER,
      description: 'Volunteer description'
    });
  });

  it('should throw error with invalid email', async () => {
    const command = new LoginCommand('nonexistent@example.com', 'correctPassword123');
    
    await expect(handler.execute(command)).rejects.toThrow('Invalid email or password');
  });

  it('should throw error with invalid password', async () => {
    const command = new LoginCommand('owner@example.com', 'wrongPassword');
    
    await expect(handler.execute(command)).rejects.toThrow('Invalid email or password');
  });

  it('should throw error with empty email', async () => {
    const command = new LoginCommand('', 'correctPassword123');
    
    await expect(handler.execute(command)).rejects.toThrow('Invalid email or password');
  });

  it('should generate different tokens for different logins', async () => {
    const command1 = new LoginCommand('owner@example.com', 'correctPassword123');
    const command2 = new LoginCommand('volunteer@example.com', 'correctPassword123');
    
    const result1 = await handler.execute(command1);
    const result2 = await handler.execute(command2);
    
    expect(result1.token).not.toBe(result2.token);
    expect(result1.user.type).toBe(UserType.OWNER);
    expect(result2.user.type).toBe(UserType.VOLUNTEER);
  });
});
