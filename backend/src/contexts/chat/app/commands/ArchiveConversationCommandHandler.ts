import { ArchiveConversationCommand } from './ArchiveConversationCommand.js';
import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class ArchiveConversationCommandHandler {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async handle(command: ArchiveConversationCommand): Promise<Conversation> {
    const conversation = await this.conversationRepository.findById(command.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    if (!conversation.isParticipant(command.userId)) {
      throw new Error('User is not a participant in this conversation');
    }

    // Archive the conversation
    conversation.archive();
    
    return await this.conversationRepository.update(conversation);
  }
}
