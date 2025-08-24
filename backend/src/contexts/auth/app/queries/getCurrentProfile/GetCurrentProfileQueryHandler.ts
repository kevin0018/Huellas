import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { GetCurrentProfileQuery } from './GetCurrentProfileQuery.js';
import { UserType } from '../../../domain/entities/UserAuth.js';

export interface UserProfileResult {
  id: number;
  name: string;
  lastName: string;
  email: string;
  type: UserType;
  description?: string;
}

export class GetCurrentProfileQueryHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async handle(query: GetCurrentProfileQuery): Promise<UserProfileResult | null> {
    const userWithDescription = await this.authRepository.getUserWithDescription(query.userId);
    
    if (!userWithDescription) {
      return null;
    }

    return {
      id: userWithDescription.user.id,
      name: userWithDescription.user.name,
      lastName: userWithDescription.user.lastName,
      email: userWithDescription.user.email,
      type: userWithDescription.user.type,
      description: userWithDescription.description
    };
  }
}
