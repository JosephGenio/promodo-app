import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { getUserById } from './user.service';

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await getUserById(req.userId!);
  res.json(user);
}
