import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import type { Reflection } from '../../generated/prisma/client';
import type { CreateReflectionInput, UpdateReflectionInput } from './reflection.validation';

export type PublicReflection = {
  id: string;
  date: Date;
  subject: string;
  learned: string;
  challenges: string;
  productivity: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicReflection(reflection: Reflection): PublicReflection {
  return {
    id: reflection.id,
    date: reflection.date,
    subject: reflection.subject,
    learned: reflection.learned,
    challenges: reflection.challenges,
    productivity: reflection.productivity,
    createdAt: reflection.createdAt,
    updatedAt: reflection.updatedAt,
  };
}

export async function listReflections(userId: string): Promise<PublicReflection[]> {
  const reflections = await prisma.reflection.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  return reflections.map(toPublicReflection);
}

export async function createReflection(
  userId: string,
  input: CreateReflectionInput,
): Promise<PublicReflection> {
  const reflection = await prisma.reflection.create({
    data: {
      userId,
      subject: input.subject,
      learned: input.learned,
      challenges: input.challenges,
      productivity: input.productivity,
      date: input.date ? new Date(input.date) : undefined,
    },
  });
  return toPublicReflection(reflection);
}

async function findOwnedReflection(userId: string, id: string): Promise<Reflection> {
  const reflection = await prisma.reflection.findFirst({ where: { id, userId } });
  if (!reflection) {
    throw notFound('Reflection not found');
  }
  return reflection;
}

export async function updateReflection(
  userId: string,
  id: string,
  input: UpdateReflectionInput,
): Promise<PublicReflection> {
  await findOwnedReflection(userId, id);
  const reflection = await prisma.reflection.update({ where: { id }, data: input });
  return toPublicReflection(reflection);
}

export async function deleteReflection(userId: string, id: string): Promise<void> {
  await findOwnedReflection(userId, id);
  await prisma.reflection.delete({ where: { id } });
}
