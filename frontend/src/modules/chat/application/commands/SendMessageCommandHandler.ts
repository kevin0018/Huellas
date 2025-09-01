import type { ChatRepository } from '../../domain/ChatRepository';
import type { Message } from '../../domain/Conversation';
import { SendMessageCommand } from './SendMessageCommand';

export class SendMessageCommandHandler {
  private readonly chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async handle(command: SendMessageCommand): Promise<Message> {
    return this.chatRepository.sendMessage({
      conversationId: command.conversationId,
      content: command.content,
      type: command.type,
    });
  }
}
