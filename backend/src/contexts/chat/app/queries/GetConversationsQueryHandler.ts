import { GetConversationsQuery } from './GetConversationsQuery.js';
import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class GetConversationsQueryHandler {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async handle(query: GetConversationsQuery): Promise<Conversation[]> {
    return await this.conversationRepository.findByParticipant(query.userId);
  }
}
