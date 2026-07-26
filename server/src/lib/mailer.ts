import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

const transporter: Transporter | null = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  if (!transporter) {
    // Local dev fallback: no SMTP configured, so just log the code instead
    // of failing — this is what lets the forgot-password flow be tested
    // end-to-end without a real email service.
    console.log(`[mailer] SMTP not configured — password reset code for ${to}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Your StudyMate password reset code',
    text: `Your password reset code is ${code}. It expires in ${env.RESET_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}
