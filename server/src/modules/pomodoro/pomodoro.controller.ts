import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { createSessionSchema, updateSessionSchema, listSessionsQuerySchema } from './pomodoro.validation';
import { listSessions, createSession, updateSession, deleteSession } from './pomodoro.service';

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const query = listSessionsQuerySchema.parse(req.query);
  const sessions = await listSessions(req.userId!, query.since);
  res.json(sessions);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = createSessionSchema.parse(req.body);
  const session = await createSession(req.userId!, input);
  res.status(201).json(session);
}

export async function update(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = updateSessionSchema.parse(req.body);
  const session = await updateSession(req.userId!, req.params.id, input);
  res.json(session);
}

export async function remove(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  await deleteSession(req.userId!, req.params.id);
  res.status(204).send();
}
