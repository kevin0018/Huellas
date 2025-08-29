import { GetMessagesQuery } from './GetMessagesQuery.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';

export class GetMessagesQueryHandler {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(query: GetMessagesQuery): Promise<Message[]> {
    return await this.messageRepository.findByConversationId(
      query.conversationId,
      query.limit,
      query.offset
    );
  }
}
