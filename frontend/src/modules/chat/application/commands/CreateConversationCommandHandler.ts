import type { ChatRepository } from '../../domain/ChatRepository';
import type { Conversation } from '../../domain/Conversation';
import { CreateConversationCommand } from './CreateConversationCommand';

export class CreateConversationCommandHandler {
  private readonly chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async handle(command: CreateConversationCommand): Promise<Conversation> {
    return this.chatRepository.createConversation({
      title: command.title,
      participantIds: command.participantIds,
    });
  }
}
