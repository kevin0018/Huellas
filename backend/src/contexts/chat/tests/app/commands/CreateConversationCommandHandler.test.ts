import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationStatus } from '@prisma/client';
import { CreateConversationCommand } from '../../../app/commands/CreateConversationCommand.js';
import { CreateConversationCommandHandler } from '../../../app/commands/CreateConversationCommandHandler.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';

describe('CreateConversationCommandHandler', () => {
  let handler: CreateConversationCommandHandler;
  let conversationRepository: MemoryConversationRepository;

  beforeEach(() => {
    conversationRepository = new MemoryConversationRepository();
    handler = new CreateConversationCommandHandler(conversationRepository);
  });

  describe('handle', () => {
    it('should create a new conversation successfully', async () => {
      // Arrange
      const command: CreateConversationCommand = {
        title: 'New Chat',
        createdBy: 1,
        participantIds: [1, 2, 3]
      };

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.id).toBeGreaterThan(0);
      expect(result.title).toBe('New Chat');
      expect(result.createdBy).toBe(1);
      expect(result.participantIds).toEqual([1, 2, 3]);
      expect(result.status).toBe(ConversationStatus.ACTIVE);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create conversation without title', async () => {
      // Arrange
      const command: CreateConversationCommand = {
        createdBy: 1,
        participantIds: [1, 2]
      };

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.title).toBeNull();
      expect(result.participantIds).toEqual([1, 2]);
    });

    it('should persist the conversation in repository', async () => {
      // Arrange
      const command: CreateConversationCommand = {
        title: 'Persistent Chat',
        createdBy: 1,
        participantIds: [1, 2]
      };

      // Act
      const result = await handler.handle(command);

      // Assert
      const retrieved = await conversationRepository.findById(result.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.title).toBe('Persistent Chat');
    });

    it('should handle multiple participants', async () => {
      // Arrange
      const command: CreateConversationCommand = {
        title: 'Group Chat',
        createdBy: 1,
        participantIds: [1, 2, 3, 4, 5]
      };

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.participantIds).toHaveLength(5);
      expect(result.participantIds).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
