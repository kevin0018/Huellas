import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationStatus } from '@prisma/client';
import { ArchiveConversationCommand } from '../../../app/commands/ArchiveConversationCommand.js';
import { ArchiveConversationCommandHandler } from '../../../app/commands/ArchiveConversationCommandHandler.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';

describe('ArchiveConversationCommandHandler', () => {
  let handler: ArchiveConversationCommandHandler;
  let conversationRepository: MemoryConversationRepository;

  beforeEach(() => {
    conversationRepository = new MemoryConversationRepository();
    handler = new ArchiveConversationCommandHandler(conversationRepository);
  });

  describe('handle', () => {
    it('should archive an existing conversation', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const command: ArchiveConversationCommand = {
        conversationId: conversation.id,
        userId: 1
      };

      // Act
      await handler.handle(command);

      // Assert
      const archivedConversation = await conversationRepository.findById(conversation.id);
      expect(archivedConversation!.status).toBe(ConversationStatus.ARCHIVED);
    });

    it('should throw error when conversation does not exist', async () => {
      // Arrange
      const command: ArchiveConversationCommand = {
        conversationId: 999,
        userId: 1
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('Conversation not found');
    });

    it('should throw error when user is not a participant', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Private Chat', 1, [1, 2])
      );
      
      const command: ArchiveConversationCommand = {
        conversationId: conversation.id,
        userId: 3 // not a participant
      };

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('User is not a participant in this conversation');
    });

    it('should not affect already archived conversations', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      // Archive it first
      conversation.archive();
      await conversationRepository.update(conversation);
      
      const command: ArchiveConversationCommand = {
        conversationId: conversation.id,
        userId: 1
      };

      // Act
      await handler.handle(command);

      // Assert
      const result = await conversationRepository.findById(conversation.id);
      expect(result!.status).toBe(ConversationStatus.ARCHIVED);
    });
  });
});
