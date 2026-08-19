import type { ChatRepository } from '../../domain/ChatRepository';
import type { ConversationListItem } from '../../domain/Conversation';
import { GetConversationsQuery } from './GetConversationsQuery';

export class GetConversationsQueryHandler {
  private readonly chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async handle(_query: GetConversationsQuery): Promise<ConversationListItem[]> {
    void _query;
    return this.chatRepository.getConversations();
  }
}
