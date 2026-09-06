import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/infra/middleware/JwtMiddleware.js';
import type { ReminderApplicationService } from './ReminderApplicationService.js';

export class ReminderController {
  constructor(private readonly reminders: ReminderApplicationService) {}

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json(await this.reminders.list(req.user.userId));
  }

  async action(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await this.reminders.applyAction(req.user.userId, Number(req.params.id), req.body.action, req.body.days);
    if (result === 'not-found') { res.status(404).json({ error: 'Reminder not found' }); return; }
    if (result === 'invalid') { res.status(400).json({ error: req.body.action === 'postpone' ? 'Postpone days must be between 1 and 365' : 'Invalid reminder action' }); return; }
    res.status(204).send();
  }

  async preferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    const enabled = req.body.enabled;
    const leadDays = Number(req.body.leadDays);
    if (typeof enabled !== 'boolean' || !Number.isInteger(leadDays) || leadDays < 1 || leadDays > 90) { res.status(400).json({ error: 'Invalid reminder preferences' }); return; }
    res.json(await this.reminders.updatePreferences(req.user.userId, enabled, leadDays));
  }
}
