import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import type { User } from '../../generated/prisma/client';

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
};

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name };
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw notFound('User not found');
  }
  return toPublicUser(user);
}
