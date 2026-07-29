import { z } from 'zod';

export const createReflectionSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required'),
  learned: z.string().trim().optional().default(''),
  challenges: z.string().trim().optional().default(''),
  productivity: z.number().int().min(0).max(5).optional().default(0),
  date: z.string().datetime().optional(),
});

export const updateReflectionSchema = z.object({
  subject: z.string().trim().min(1).optional(),
  learned: z.string().trim().optional(),
  challenges: z.string().trim().optional(),
  productivity: z.number().int().min(0).max(5).optional(),
});

export type CreateReflectionInput = z.infer<typeof createReflectionSchema>;
export type UpdateReflectionInput = z.infer<typeof updateReflectionSchema>;
