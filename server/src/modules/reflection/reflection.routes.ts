import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { list, create, update, remove } from './reflection.controller';

export const reflectionRouter = Router();

reflectionRouter.use(requireAuth);

reflectionRouter.get('/', list);
reflectionRouter.post('/', create);
reflectionRouter.patch('/:id', update);
reflectionRouter.delete('/:id', remove);
