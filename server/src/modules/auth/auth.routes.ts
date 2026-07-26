import { Router } from 'express';
import { authRateLimiter } from '../../middleware/authRateLimiter';
import { register, login } from './auth.controller';

export const authRouter = Router();

authRouter.use(authRateLimiter);
authRouter.post('/register', register);
authRouter.post('/login', login);
