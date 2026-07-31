import type { Request, Response } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from './auth.validation';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  confirmPasswordReset,
  googleAuth,
} from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);
  res.json(result);
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const input = forgotPasswordSchema.parse(req.body);
  const result = await requestPasswordReset(input);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const input = resetPasswordSchema.parse(req.body);
  const result = await confirmPasswordReset(input);
  res.json(result);
}

export async function google(req: Request, res: Response): Promise<void> {
  const input = googleAuthSchema.parse(req.body);
  const result = await googleAuth(input);
  res.json(result);
}
