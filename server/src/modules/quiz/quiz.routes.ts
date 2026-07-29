import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { list, create, getById, update, remove, createAttempt, listQuizAttempts } from './quiz.controller';

export const quizRouter = Router();

quizRouter.use(requireAuth);

quizRouter.get('/', list);
quizRouter.post('/', create);
quizRouter.get('/:id', getById);
quizRouter.patch('/:id', update);
quizRouter.delete('/:id', remove);
quizRouter.post('/:id/attempts', createAttempt);
quizRouter.get('/:id/attempts', listQuizAttempts);
