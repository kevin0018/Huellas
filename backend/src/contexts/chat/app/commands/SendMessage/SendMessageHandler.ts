import { MessageRepository } from '../../../domain/repositories/MessageRepository.js';
import { Message } from '../../../domain/entities/Message.js';
import { SendMessageCommand } from './SendMessageCommand.js';
import { MessageType } from '../../../../../types/chat.js';

export class SendMessageHandler {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    const now = new Date();
    const message = new Message(
      0,
      command.conversationId,
      command.senderId,
      command.content,
      command.type as MessageType,
      now,
      now,
      null,
    );
    return this.messageRepo.create(message);
  }
}
