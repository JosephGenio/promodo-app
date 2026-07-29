import { z } from 'zod';

const questionSchema = z
  .object({
    text: z.string().trim().min(1, 'Question text is required'),
    options: z.array(z.string().trim().min(1)).min(2, 'At least 2 options are required'),
    correctIndex: z.number().int().min(0),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: 'correctIndex must be a valid option index',
    path: ['correctIndex'],
  });

export const createQuizSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional().default(''),
  questions: z.array(questionSchema).min(1, 'At least 1 question is required'),
});

export const updateQuizSchema = z.object({
  subject: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  questions: z.array(questionSchema).min(1).optional(),
});

export const submitAttemptSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
