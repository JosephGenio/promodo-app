import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { list, create, update, remove } from './todo.controller';

export const todoRouter = Router();

todoRouter.use(requireAuth);

todoRouter.get('/', list);
todoRouter.post('/', create);
todoRouter.patch('/:id', update);
todoRouter.delete('/:id', remove);
