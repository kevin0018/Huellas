import { GetUnreadMessagesCountQuery } from './GetUnreadMessagesCountQuery.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';

export class GetUnreadMessagesCountQueryHandler {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(query: GetUnreadMessagesCountQuery): Promise<number> {
    return await this.messageRepository.getUnreadCount(query.userId);
  }
}
