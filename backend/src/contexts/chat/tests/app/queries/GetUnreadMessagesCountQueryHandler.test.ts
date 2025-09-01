import { describe, it, expect, beforeEach } from 'vitest';
import { MessageType } from '@prisma/client';
import { GetUnreadMessagesCountQuery } from '../../../app/queries/GetUnreadMessagesCountQuery.js';
import { GetUnreadMessagesCountQueryHandler } from '../../../app/queries/GetUnreadMessagesCountQueryHandler.js';
import { MemoryMessageRepository } from '../../../infra/repositories/MemoryMessageRepository.js';
import { Message } from '../../../domain/entities/Message.js';

describe('GetUnreadMessagesCountQueryHandler', () => {
  let handler: GetUnreadMessagesCountQueryHandler;
  let messageRepository: MemoryMessageRepository;

  beforeEach(() => {
    messageRepository = new MemoryMessageRepository();
    handler = new GetUnreadMessagesCountQueryHandler(messageRepository);
  });

  describe('handle', () => {
    it('should return 0 for memory implementation', async () => {
      // Arrange
      await messageRepository.save(
        Message.create(1, 2, 'Test message', MessageType.TEXT)
      );

      const query: GetUnreadMessagesCountQuery = {
        userId: 1
      };

      // Act
      const result = await handler.handle(query);

      // Assert
      // Memory repository implementation returns 0 for simplicity
      expect(result).toBe(0);
    });

    it('should handle different user IDs consistently', async () => {
      // Arrange
      await messageRepository.save(
        Message.create(1, 2, 'Message 1', MessageType.TEXT)
      );
      await messageRepository.save(
        Message.create(1, 3, 'Message 2', MessageType.TEXT)
      );

      const query1: GetUnreadMessagesCountQuery = { userId: 1 };
      const query2: GetUnreadMessagesCountQuery = { userId: 2 };

      // Act
      const result1 = await handler.handle(query1);
      const result2 = await handler.handle(query2);

      // Assert
      expect(result1).toBe(0);
      expect(result2).toBe(0);
    });
  });
});
