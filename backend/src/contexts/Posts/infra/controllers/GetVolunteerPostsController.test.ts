import type { Request, Response } from 'express';
import { PostStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { ListVolunteerPostsUseCase } from '../../app/usecases/ListVolunteerPostsUseCase.js';
import { GetVolunteerPostsController } from './GetVolunteerPostsController.js';

describe('GetVolunteerPostsController composition', () => {
  it('delegates parsed filters to the injected use case', async () => {
    const execute = vi.fn().mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 5 });
    const controller = new GetVolunteerPostsController({ execute } as unknown as ListVolunteerPostsUseCase);
    const request = {
      query: { page: '2', pageSize: '5', status: PostStatus.PUBLISHED, includeExpired: 'true' },
    } as unknown as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const response = { status } as unknown as Response;

    await controller.handle(request, response);

    expect(execute).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      pageSize: 5,
      status: PostStatus.PUBLISHED,
      includeExpired: true,
    }));
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ items: [], total: 0, page: 2, pageSize: 5 });
  });
});
