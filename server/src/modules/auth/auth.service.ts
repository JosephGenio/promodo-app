import bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../generated/prisma/client';
import { signToken } from '../../lib/jwt';
import { sendPasswordResetEmail } from '../../lib/mailer';
import { env } from '../../config/env';
import { badRequest, conflict, unauthorized } from '../../lib/errors';
import { toPublicUser, type PublicUser } from '../user/user.service';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.validation';

const SALT_ROUNDS = 10;
const DUPLICATE_KEY_ERROR_CODE = 'P2002';
const MAX_RESET_ATTEMPTS = 5;
const RESET_CODE_MIN = 100000;
const RESET_CODE_MAX = 1000000; // exclusive upper bound for randomInt

// Deliberately identical whether or not the email/code is valid, so the
// response never reveals which part of the flow failed (account existence,
// wrong code, or expiry) to an attacker probing the endpoint.
const GENERIC_RESET_REQUEST_MESSAGE = 'If that email has an account, a reset code has been sent.';
const GENERIC_RESET_FAILURE_MESSAGE = 'Invalid or expired code';

type AuthResult = {
  token: string;
  user: PublicUser;
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  // Pre-check for a fast, clean rejection in the common case — but this
  // alone has a TOCTOU race (two concurrent registrations for the same
  // email can both pass it before either finishes creating a row), so the
  // create() below is also guarded against the database's own unique
  // constraint via the catch below, which is what actually guarantees
  // uniqueness.
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash },
    });
    return { token: signToken({ sub: user.id }), user: toPublicUser(user) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === DUPLICATE_KEY_ERROR_CODE
    ) {
      throw conflict('An account with this email already exists');
    }
    throw error;
  }
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Only ever act if the user exists — but always return the same message
  // either way, so this endpoint can't be used to enumerate registered
  // emails by comparing responses.
  if (user) {
    const code = randomInt(RESET_CODE_MIN, RESET_CODE_MAX).toString();
    const resetTokenHash = await bcrypt.hash(code, SALT_ROUNDS);
    const resetTokenExpiry = new Date(Date.now() + env.RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash, resetTokenExpiry, resetAttempts: 0 },
    });

    await sendPasswordResetEmail(user.email, code);
  }

  return { message: GENERIC_RESET_REQUEST_MESSAGE };
}

export async function confirmPasswordReset(input: ResetPasswordInput): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.resetTokenHash || !user.resetTokenExpiry) {
    throw badRequest(GENERIC_RESET_FAILURE_MESSAGE);
  }

  if (user.resetTokenExpiry.getTime() < Date.now()) {
    throw badRequest(GENERIC_RESET_FAILURE_MESSAGE);
  }

  if (user.resetAttempts >= MAX_RESET_ATTEMPTS) {
    throw badRequest('Too many attempts — request a new code');
  }

  const codeMatches = await bcrypt.compare(input.code, user.resetTokenHash);
  if (!codeMatches) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: { increment: 1 } },
    });
    throw badRequest(GENERIC_RESET_FAILURE_MESSAGE);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiry: null, resetAttempts: 0 },
  });

  return { message: 'Password reset successfully' };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw unauthorized('Invalid email or password');
  }

  return { token: signToken({ sub: user.id }), user: toPublicUser(user) };
}
