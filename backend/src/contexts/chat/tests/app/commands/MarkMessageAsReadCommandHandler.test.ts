import { describe, it, expect, beforeEach } from 'vitest';
import { MessageType } from '@prisma/client';
import { MarkMessageAsReadCommand } from '../../../app/commands/MarkMessageAsReadCommand.js';
import { MarkMessageAsReadCommandHandler } from '../../../app/commands/MarkMessageAsReadCommandHandler.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { MemoryMessageRepository } from '../../../infra/repositories/MemoryMessageRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';
import { Message } from '../../../domain/entities/Message.js';

describe('MarkMessageAsReadCommandHandler', () => {
  let handler: MarkMessageAsReadCommandHandler;
  let conversationRepository: MemoryConversationRepository;
  let messageRepository: MemoryMessageRepository;

  beforeEach(() => {
    conversationRepository = new MemoryConversationRepository();
    messageRepository = new MemoryMessageRepository();
    handler = new MarkMessageAsReadCommandHandler(messageRepository, conversationRepository);
  });

  describe('handle', () => {
    it('should mark message as read for a participant', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const message = await messageRepository.save(
        Message.create(conversation.id, 2, 'Hello!', MessageType.TEXT)
      );
      
      const command: MarkMessageAsReadCommand = {
        messageId: message.id,
        userId: 1
      };

      // Act
      await handler.handle(command);

      // Assert
      const readTime = conversationRepository.getLastReadAt(conversation.id, 1);
      expect(readTime).toBeInstanceOf(Date);
    });

    it('should throw error when message does not exist', async () => {
      // Arrange
      const command: MarkMessageAsReadCommand = {
        messageId: 999,
        userId: 1
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('Message not found');
    });

    it('should throw error when user is not a participant', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Private Chat', 1, [1, 2])
      );
      
      const message = await messageRepository.save(
        Message.create(conversation.id, 2, 'Hello!', MessageType.TEXT)
      );
      
      const command: MarkMessageAsReadCommand = {
        messageId: message.id,
        userId: 3 // not a participant
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('User is not a participant in this conversation');
    });

    it('should update read timestamp for the conversation', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const message = await messageRepository.save(
        Message.create(conversation.id, 2, 'Hello!', MessageType.TEXT)
      );
      
      const command: MarkMessageAsReadCommand = {
        messageId: message.id,
        userId: 1
      };

      // Act
      await handler.handle(command);

      // Assert
      const readTime = conversationRepository.getLastReadAt(conversation.id, 1);
      expect(readTime).toBeInstanceOf(Date);
      expect(readTime!.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
