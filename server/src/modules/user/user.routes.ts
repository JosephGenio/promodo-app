import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { me } from './user.controller';

export const userRouter = Router();

userRouter.get('/me', requireAuth, me);
