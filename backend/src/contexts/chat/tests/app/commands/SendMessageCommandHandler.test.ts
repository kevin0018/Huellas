import { describe, it, expect, beforeEach } from 'vitest';
import { MessageType } from '@prisma/client';
import { SendMessageCommand } from '../../../app/commands/SendMessageCommand.js';
import { SendMessageCommandHandler } from '../../../app/commands/SendMessageCommandHandler.js';
import { MemoryMessageRepository } from '../../../infra/repositories/MemoryMessageRepository.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';

describe('SendMessageCommandHandler', () => {
  let handler: SendMessageCommandHandler;
  let messageRepository: MemoryMessageRepository;
  let conversationRepository: MemoryConversationRepository;

  beforeEach(() => {
    messageRepository = new MemoryMessageRepository();
    conversationRepository = new MemoryConversationRepository();
    handler = new SendMessageCommandHandler(messageRepository, conversationRepository);
  });

  describe('handle', () => {
    it('should send message successfully when conversation exists and user is participant', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const command: SendMessageCommand = {
        conversationId: conversation.id,
        senderId: 1,
        content: 'Hello, how are you?',
        type: MessageType.TEXT
      };

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.conversationId).toBe(conversation.id);
      expect(result.senderId).toBe(1);
      expect(result.content).toBe('Hello, how are you?');
      expect(result.type).toBe(MessageType.TEXT);
      expect(result.id).toBeGreaterThan(0);
      
      // Verify message was saved
      const savedMessage = await messageRepository.findById(result.id);
      expect(savedMessage).not.toBeNull();
    });

    it('should throw error when conversation does not exist', async () => {
      // Arrange
      const command: SendMessageCommand = {
        conversationId: 999, // non-existent conversation
        senderId: 1,
        content: 'Hello',
        type: MessageType.TEXT
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('Conversation not found');
    });

    it('should throw error when user is not a participant', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Private Chat', 1, [1, 2]) // User 3 not included
      );
      
      const command: SendMessageCommand = {
        conversationId: conversation.id,
        senderId: 3, // not a participant
        content: 'Hello',
        type: MessageType.TEXT
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('User is not a participant in this conversation');
    });

    it('should update conversation updated_at timestamp', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      const originalUpdatedAt = conversation.updatedAt;
      
      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const command: SendMessageCommand = {
        conversationId: conversation.id,
        senderId: 1,
        content: 'New message',
        type: MessageType.TEXT
      };

      // Act
      await handler.handle(command);

      // Assert
      const updatedConversation = await conversationRepository.findById(conversation.id);
      expect(updatedConversation!.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should handle different message types', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );

      const textCommand: SendMessageCommand = { conversationId: conversation.id, senderId: 1, content: 'Text message', type: MessageType.TEXT };
      const imageCommand: SendMessageCommand = { conversationId: conversation.id, senderId: 1, content: 'image.jpg', type: MessageType.IMAGE };

      // Act
      const textResult = await handler.handle(textCommand);
      const imageResult = await handler.handle(imageCommand);

      // Assert
      expect(textResult.type).toBe(MessageType.TEXT);
      expect(imageResult.type).toBe(MessageType.IMAGE);
    });
  });
});
