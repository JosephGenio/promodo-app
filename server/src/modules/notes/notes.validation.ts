import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().trim().optional().default('General'),
  content: z.string().trim().min(1, 'Content is required'),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().optional(),
  content: z.string().trim().min(1).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
