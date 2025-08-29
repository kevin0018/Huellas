import { ConversationRepository } from '../../../domain/repositories/ConversationRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';
import { GetConversationsByUserQuery } from './GetConversationsByUserQuery.js';

export class GetConversationsByUserHandler {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(query: GetConversationsByUserQuery): Promise<Conversation[]> {
    return this.conversationRepo.findByParticipant(query.userId);
  }
}
