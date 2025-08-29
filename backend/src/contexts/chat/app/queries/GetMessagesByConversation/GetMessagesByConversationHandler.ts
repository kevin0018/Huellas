import { MessageRepository } from '../../../domain/repositories/MessageRepository.js';
import { Message } from '../../../domain/entities/Message.js';
import { GetMessagesByConversationQuery } from './GetMessagesByConversationQuery.js';

export class GetMessagesByConversationHandler {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(query: GetMessagesByConversationQuery): Promise<Message[]> {
    return this.messageRepo.findByConversation(query.conversationId);
  }
}
