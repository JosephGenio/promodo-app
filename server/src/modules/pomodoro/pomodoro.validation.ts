import { z } from 'zod';

export const createSessionSchema = z.object({
  subject: z.string().trim().optional().default(''),
  durationSeconds: z.number().int().positive(),
  completedAt: z.string().datetime().optional(),
});

export const updateSessionSchema = z.object({
  subject: z.string().trim().optional(),
  durationSeconds: z.number().int().positive().optional(),
});

export const listSessionsQuerySchema = z.object({
  since: z.string().datetime().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
