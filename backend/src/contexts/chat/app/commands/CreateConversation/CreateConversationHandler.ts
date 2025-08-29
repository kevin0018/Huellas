import { ConversationRepository } from '../../../domain/repositories/ConversationRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';
import { CreateConversationCommand } from './CreateConversationCommand.js';
import { ConversationStatus } from '../../../../../types/chat.js';

export class CreateConversationHandler {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(command: CreateConversationCommand): Promise<Conversation> {
    const now = new Date();
    const conversation = new Conversation(
      0,
      command.title ?? null,
      ConversationStatus.ACTIVE,
      now,
      now,
      command.createdBy,
      command.participantIds,
    );
    return this.conversationRepo.create(conversation);
  }
}
