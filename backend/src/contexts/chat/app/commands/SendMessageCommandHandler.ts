import { SendMessageCommand } from './SendMessageCommand.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';
import { MessageType } from '@prisma/client';

export class SendMessageCommandHandler {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository
  ) {}

  async handle(command: SendMessageCommand): Promise<Message> {
    // Verify conversation exists
    const conversation = await this.conversationRepository.findById(command.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    if (!conversation.isParticipant(command.senderId)) {
      throw new Error('User is not a participant in this conversation');
    }

    // Convert string type to enum
    let messageType: MessageType;
    switch (command.type?.toLowerCase()) {
      case 'image':
        messageType = MessageType.IMAGE;
        break;
      case 'file':
        messageType = MessageType.FILE;
        break;
      case 'system':
        messageType = MessageType.SYSTEM;
        break;
      default:
        messageType = MessageType.TEXT;
    }

    const message = Message.create(
      command.conversationId,
      command.senderId,
      command.content,
      messageType
    );

    return await this.messageRepository.save(message);
  }
}
