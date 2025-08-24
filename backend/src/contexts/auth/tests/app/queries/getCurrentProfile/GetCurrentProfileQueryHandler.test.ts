import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCurrentProfileQueryHandler } from '../../../../app/queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';
import { GetCurrentProfileQuery } from '../../../../app/queries/getCurrentProfile/GetCurrentProfileQuery.js';
import { AuthRepository } from '../../../../domain/repositories/AuthRepository.js';
import { UserAuth, UserType } from '../../../../domain/entities/UserAuth.js';

describe('GetCurrentProfileQueryHandler', () => {
  let handler: GetCurrentProfileQueryHandler;
  let mockAuthRepository: AuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      getUserWithDescription: vi.fn(),
      verifyPassword: vi.fn(),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
      createVolunteerProfile: vi.fn(),
      deleteVolunteerProfile: vi.fn(),
      hasVolunteerProfile: vi.fn()
    };
    
    handler = new GetCurrentProfileQueryHandler(mockAuthRepository);
  });

  it('should return user profile with description for volunteer', async () => {
    // Arrange
    const userId = 1;
    const mockUser = UserAuth.create(
      userId,
      'John',
      'Doe',
      'john@example.com',
      'hashedPassword',
      UserType.VOLUNTEER
    );
    const description = 'Experienced with dogs and cats';

    vi.mocked(mockAuthRepository.getUserWithDescription).mockResolvedValue({
      user: mockUser,
      description
    });

    const query = new GetCurrentProfileQuery(userId);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockAuthRepository.getUserWithDescription).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      id: userId,
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      type: UserType.VOLUNTEER,
      description
    });
  });

  it('should return user profile without description for owner', async () => {
    // Arrange
    const userId = 2;
    const mockUser = UserAuth.create(
      userId,
      'Jane',
      'Smith',
      'jane@example.com',
      'hashedPassword',
      UserType.OWNER
    );

    vi.mocked(mockAuthRepository.getUserWithDescription).mockResolvedValue({
      user: mockUser,
      description: undefined
    });

    const query = new GetCurrentProfileQuery(userId);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockAuthRepository.getUserWithDescription).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      id: userId,
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      type: UserType.OWNER,
      description: undefined
    });
  });

  it('should return null when user is not found', async () => {
    // Arrange
    const userId = 999;
    vi.mocked(mockAuthRepository.getUserWithDescription).mockResolvedValue(null);

    const query = new GetCurrentProfileQuery(userId);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(mockAuthRepository.getUserWithDescription).toHaveBeenCalledWith(userId);
    expect(result).toBeNull();
  });

  it('should handle repository errors', async () => {
    // Arrange
    const userId = 1;
    const error = new Error('Database connection failed');
    vi.mocked(mockAuthRepository.getUserWithDescription).mockRejectedValue(error);

    const query = new GetCurrentProfileQuery(userId);

    // Act & Assert
    await expect(handler.handle(query)).rejects.toThrow('Database connection failed');
    expect(mockAuthRepository.getUserWithDescription).toHaveBeenCalledWith(userId);
  });
});
