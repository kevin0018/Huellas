import { SendMessageCommand } from './SendMessageCommand.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';
import { MessageType } from '../../../../types/chat.js';

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

    const messageType = command.type as MessageType || MessageType.TEXT;
    const message = Message.create(
      command.conversationId,
      command.senderId,
      command.content,
      messageType
    );

    return await this.messageRepository.save(message);
  }
}
