import { CreateConversationCommand } from './CreateConversationCommand.js';
import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class CreateConversationCommandHandler {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async handle(command: CreateConversationCommand): Promise<Conversation> {
    // Validate that the creator is included in the participant list
    if (!command.participantIds.includes(command.createdBy)) {
      command.participantIds.push(command.createdBy);
    }

    // For direct messages (2 participants), check if conversation already exists
    if (command.participantIds.length === 2) {
      const existingConversations = await this.conversationRepository.findByParticipant(command.createdBy);
      const existingDirectMessage = existingConversations.find(conv => {
        return conv.participantIds.length === 2 && 
               conv.participantIds.every(id => command.participantIds.includes(id));
      });
      
      if (existingDirectMessage) {
        return existingDirectMessage;
      }
    }

    const conversation = Conversation.create(
      command.title || null,
      command.createdBy,
      command.participantIds
    );

    return await this.conversationRepository.create(conversation);
  }
}
