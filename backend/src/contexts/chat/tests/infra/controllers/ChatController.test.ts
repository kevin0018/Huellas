import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchiveConversationCommandHandler } from '../../../app/commands/ArchiveConversationCommandHandler.js';
import { CreateConversationCommandHandler } from '../../../app/commands/CreateConversationCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from '../../../app/commands/MarkMessageAsReadCommandHandler.js';
import { SendMessageCommandHandler } from '../../../app/commands/SendMessageCommandHandler.js';
import { GetConversationsQueryHandler } from '../../../app/queries/GetConversationsQueryHandler.js';
import { GetMessagesQueryHandler } from '../../../app/queries/GetMessagesQueryHandler.js';
import { GetUnreadMessagesCountQueryHandler } from '../../../app/queries/GetUnreadMessagesCountQueryHandler.js';
import { ChatController } from '../../../infra/controllers/ChatController.js';
import { MemoryConversationRepository } from '../../../infra/repositories/MemoryConversationRepository.js';
import { MemoryMessageRepository } from '../../../infra/repositories/MemoryMessageRepository.js';
import type { AuthenticatedRequest } from '../../../../auth/infra/middleware/JwtMiddleware.js';

describe('ChatController composition', () => {
  let controller: ChatController;
  let response: Response;
  let json: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const conversations = new MemoryConversationRepository();
    const messages = new MemoryMessageRepository();
    controller = new ChatController({
      conversationRepository: conversations,
      createConversation: new CreateConversationCommandHandler(conversations),
      sendMessage: new SendMessageCommandHandler(messages, conversations),
      markAsRead: new MarkMessageAsReadCommandHandler(messages, conversations),
      archiveConversation: new ArchiveConversationCommandHandler(conversations),
      getConversations: new GetConversationsQueryHandler(conversations),
      getMessages: new GetMessagesQueryHandler(messages, conversations),
      getUnreadCount: new GetUnreadMessagesCountQueryHandler(messages),
    });

    json = vi.fn();
    response = { json } as unknown as Response;
  });

  it('uses the injected handlers without requiring Prisma', async () => {
    const request = { user: { userId: 7 } } as AuthenticatedRequest;

    await controller.getConversations(request, response);

    expect(json).toHaveBeenCalledWith({ success: true, data: [] });
  });
});
