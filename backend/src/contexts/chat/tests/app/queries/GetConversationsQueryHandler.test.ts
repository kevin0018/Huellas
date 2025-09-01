import { describe, it, expect, beforeEach } from 'vitest';
import { GetConversationsQuery } from '../../../app/queries/GetConversationsQuery.js';
import { GetConversationsQueryHandler } from '../../../app/queries/GetConversationsQueryHandler.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { Conversation } from '../../../domain/entities/Conversation.js';

describe('GetConversationsQueryHandler', () => {
  let handler: GetConversationsQueryHandler;
  let conversationRepository: MemoryConversationRepository;

  beforeEach(() => {
    conversationRepository = new MemoryConversationRepository();
    handler = new GetConversationsQueryHandler(conversationRepository);
  });

  describe('handle', () => {
    it('should return conversations for a user', async () => {
      // Arrange
      const conv1 = await conversationRepository.create(
        Conversation.create('Chat 1', 1, [1, 2])
      );
      const conv2 = await conversationRepository.create(
        Conversation.create('Chat 2', 1, [1, 3])
      );
      await conversationRepository.create(
        Conversation.create('Other Chat', 2, [2, 3]) // User 1 not participant
      );

      const query: GetConversationsQuery = {
        userId: 1
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain(conv1.id);
      expect(result.map(c => c.id)).toContain(conv2.id);
    });

    it('should return conversations sorted by updated date', async () => {
      // Arrange
      const conv1 = await conversationRepository.create(
        Conversation.create('First Chat', 1, [1, 2])
      );
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const conv2 = await conversationRepository.create(
        Conversation.create('Second Chat', 1, [1, 3])
      );

      const query: GetConversationsQuery = {
        userId: 1
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(conv2.id); // Newer conversation first
      expect(result[1].id).toBe(conv1.id);
    });

    it('should return empty array when user has no conversations', async () => {
      // Arrange
      await conversationRepository.create(
        Conversation.create('Other Chat', 2, [2, 3])
      );

      const query: GetConversationsQuery = {
        userId: 999
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should include conversation details', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );

      const query: GetConversationsQuery = {
        userId: 1
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(1);
      const conv = result[0];
      expect(conv.id).toBe(conversation.id);
      expect(conv.title).toBe('Test Chat');
      expect(conv.createdBy).toBe(1);
      expect(conv.participantIds).toEqual([1, 2]);
    });
  });
});
