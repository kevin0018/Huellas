import { describe, it, expect, beforeEach } from 'vitest';
import { MessageType } from '@prisma/client';
import { GetMessagesQuery } from '../../../app/queries/GetMessagesQuery.js';
import { GetMessagesQueryHandler } from '../../../app/queries/GetMessagesQueryHandler.js';
import { MemoryMessageRepository } from '../../../infra/repositories/MemoryMessageRepository.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { Message } from '../../../domain/entities/Message.js';
import { Conversation } from '../../../domain/entities/Conversation.js';

describe('GetMessagesQueryHandler', () => {
  let handler: GetMessagesQueryHandler;
  let messageRepository: MemoryMessageRepository;
  let conversationRepository: MemoryConversationRepository;

  beforeEach(() => {
    messageRepository = new MemoryMessageRepository();
    conversationRepository = new MemoryConversationRepository();
    handler = new GetMessagesQueryHandler(messageRepository);
  });

  describe('handle', () => {
    it('should return messages for a conversation', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const msg1 = await messageRepository.save(
        Message.create(conversation.id, 1, 'Hello', MessageType.TEXT)
      );
      const msg2 = await messageRepository.save(
        Message.create(conversation.id, 2, 'Hi there', MessageType.TEXT)
      );
      
      // Message in different conversation
      await messageRepository.save(
        Message.create(999, 1, 'Other message', MessageType.TEXT)
      );

      const query: GetMessagesQuery = {
        conversationId: conversation.id,
        limit: 10,
        offset: 0
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toContain(msg1.id);
      expect(result.map(m => m.id)).toContain(msg2.id);
    });

    it('should return messages sorted by creation date ascending', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const msg1 = await messageRepository.save(
        Message.create(conversation.id, 1, 'First', MessageType.TEXT)
      );
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const msg2 = await messageRepository.save(
        Message.create(conversation.id, 2, 'Second', MessageType.TEXT)
      );

      const query: GetMessagesQuery = {
        conversationId: conversation.id,
        limit: 10,
        offset: 0
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(msg1.id); // Older message first
      expect(result[1].id).toBe(msg2.id); // Newer message last (natural chat flow)
    });

    it('should return empty array when conversation has no messages', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Empty Chat', 1, [1, 2])
      );

      const query: GetMessagesQuery = {
        conversationId: conversation.id,
        limit: 10,
        offset: 0
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      // Create 5 messages
      for (let i = 1; i <= 5; i++) {
        await messageRepository.save(
          Message.create(conversation.id, 1, `Message ${i}`, MessageType.TEXT)
        );
      }

      const query: GetMessagesQuery = {
        conversationId: conversation.id,
        limit: 2,
        offset: 1
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should include message details', async () => {
      // Arrange
      const conversation = await conversationRepository.create(
        Conversation.create('Test Chat', 1, [1, 2])
      );
      
      const message = await messageRepository.save(
        Message.create(conversation.id, 1, 'Test message', MessageType.TEXT)
      );

      const query: GetMessagesQuery = {
        conversationId: conversation.id,
        limit: 10,
        offset: 0
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(1);
      const msg = result[0];
      expect(msg.id).toBe(message.id);
      expect(msg.content).toBe('Test message');
      expect(msg.senderId).toBe(1);
      expect(msg.type).toBe(MessageType.TEXT);
      expect(msg.conversationId).toBe(conversation.id);
    });
  });
});
