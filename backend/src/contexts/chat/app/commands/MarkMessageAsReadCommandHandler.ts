import { MarkMessageAsReadCommand } from './MarkMessageAsReadCommand.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class MarkMessageAsReadCommandHandler {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository
  ) {}

  async handle(command: MarkMessageAsReadCommand): Promise<void> {
    const message = await this.messageRepository.findById(command.messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const conversation = await this.conversationRepository.findById(message.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant in conversation
    if (!conversation.isParticipant(command.userId)) {
      throw new Error('User is not a participant in this conversation');
    }

    // Update the last_read_at timestamp for this user in this conversation
    await this.conversationRepository.updateLastReadAt(conversation.id, command.userId, new Date());
  }
}
