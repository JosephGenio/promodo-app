import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { list, create, update, remove } from './pomodoro.controller';

export const pomodoroRouter = Router();

pomodoroRouter.use(requireAuth);

pomodoroRouter.get('/sessions', list);
pomodoroRouter.post('/sessions', create);
pomodoroRouter.patch('/sessions/:id', update);
pomodoroRouter.delete('/sessions/:id', remove);
