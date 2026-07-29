import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { list, create, update, remove } from './notes.controller';

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get('/', list);
notesRouter.post('/', create);
notesRouter.patch('/:id', update);
notesRouter.delete('/:id', remove);
