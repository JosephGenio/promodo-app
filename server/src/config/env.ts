import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('*'),

  // SMTP is optional: when SMTP_HOST is unset (local dev), lib/mailer.ts
  // logs the reset code to the console instead of sending a real email.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('StudyMate <no-reply@studymate.app>'),

  RESET_CODE_EXPIRY_MINUTES: z.coerce.number().default(15),

  // Accepted audiences for Google Sign-In ID token verification — must match
  // the client IDs the mobile app requests tokens for (mobile/.env's
  // EXPO_PUBLIC_GOOGLE_*_CLIENT_ID). At least one should be set for Google
  // Sign-In to work; none of these being set just means that endpoint 401s.
  GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
  GOOGLE_IOS_CLIENT_ID: z.string().optional(),
  GOOGLE_WEB_CLIENT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  throw new Error('Invalid environment variables — check your .env file');
}

export const env = parsed.data;
