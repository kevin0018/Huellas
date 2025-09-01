import type { ChatRepository } from '../../domain/ChatRepository';
import type { Message } from '../../domain/Conversation';
import { GetMessagesQuery } from './GetMessagesQuery';

export class GetMessagesQueryHandler {
  private readonly chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async handle(query: GetMessagesQuery): Promise<Message[]> {
    return this.chatRepository.getMessages(query.conversationId);
  }
}
