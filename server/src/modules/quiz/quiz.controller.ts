import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { createQuizSchema, updateQuizSchema, submitAttemptSchema } from './quiz.validation';
import {
  listQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitAttempt,
  listAttempts,
} from './quiz.service';

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const quizzes = await listQuizzes(req.userId!);
  res.json(quizzes);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = createQuizSchema.parse(req.body);
  const quiz = await createQuiz(req.userId!, input);
  res.status(201).json(quiz);
}

export async function getById(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const quiz = await getQuizById(req.userId!, req.params.id);
  res.json(quiz);
}

export async function update(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = updateQuizSchema.parse(req.body);
  const quiz = await updateQuiz(req.userId!, req.params.id, input);
  res.json(quiz);
}

export async function remove(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  await deleteQuiz(req.userId!, req.params.id);
  res.status(204).send();
}

export async function createAttempt(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = submitAttemptSchema.parse(req.body);
  const attempt = await submitAttempt(req.userId!, req.params.id, input.answers);
  res.status(201).json(attempt);
}

export async function listQuizAttempts(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const attempts = await listAttempts(req.userId!, req.params.id);
  res.json(attempts);
}
