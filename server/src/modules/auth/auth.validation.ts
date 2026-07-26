import { z } from 'zod';

// trim + lowercase before the email() format check so "Test@Example.com "
// both normalizes to the same account and doesn't fail format checks on
// stray whitespace. Uniqueness (in auth.service.ts) relies on this
// normalization happening for every write and lookup, not just here.
const emailSchema = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
