import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { createReflectionSchema, updateReflectionSchema } from './reflection.validation';
import { listReflections, createReflection, updateReflection, deleteReflection } from './reflection.service';

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const reflections = await listReflections(req.userId!);
  res.json(reflections);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = createReflectionSchema.parse(req.body);
  const reflection = await createReflection(req.userId!, input);
  res.status(201).json(reflection);
}

export async function update(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = updateReflectionSchema.parse(req.body);
  const reflection = await updateReflection(req.userId!, req.params.id, input);
  res.json(reflection);
}

export async function remove(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  await deleteReflection(req.userId!, req.params.id);
  res.status(204).send();
}
