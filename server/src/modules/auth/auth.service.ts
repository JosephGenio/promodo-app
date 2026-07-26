import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../generated/prisma/client';
import { signToken } from '../../lib/jwt';
import { conflict, unauthorized } from '../../lib/errors';
import { toPublicUser, type PublicUser } from '../user/user.service';
import type { LoginInput, RegisterInput } from './auth.validation';

const SALT_ROUNDS = 10;
const DUPLICATE_KEY_ERROR_CODE = 'P2002';

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
