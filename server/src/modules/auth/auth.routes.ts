import { Router } from 'express';
import { authRateLimiter } from '../../middleware/authRateLimiter';
import { passwordResetRateLimiter } from '../../middleware/passwordResetRateLimiter';
import { register, login, forgotPassword, resetPassword } from './auth.controller';

export const authRouter = Router();

authRouter.use(authRateLimiter);
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
authRouter.post('/reset-password', passwordResetRateLimiter, resetPassword);
