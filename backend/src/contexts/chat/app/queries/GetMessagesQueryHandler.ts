import { GetMessagesQuery } from './GetMessagesQuery.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class GetMessagesQueryHandler {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository
  ) {}

  async handle(query: GetMessagesQuery): Promise<Message[]> {
    const conversation = await this.conversationRepository.findById(query.conversationId);
    if (!conversation?.isParticipant(query.userId)) {
      throw new Error('Conversation not found');
    }
    return await this.messageRepository.findByConversationId(
      query.conversationId,
      query.limit,
      query.offset
    );
  }
}
