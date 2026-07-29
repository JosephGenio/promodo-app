import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import type { PomodoroSession } from '../../generated/prisma/client';
import type { CreateSessionInput, UpdateSessionInput } from './pomodoro.validation';

export type PublicSession = {
  id: string;
  subject: string;
  durationSeconds: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicSession(session: PomodoroSession): PublicSession {
  return {
    id: session.id,
    subject: session.subject,
    durationSeconds: session.durationSeconds,
    completedAt: session.completedAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function listSessions(userId: string, since?: string): Promise<PublicSession[]> {
  const sessions = await prisma.pomodoroSession.findMany({
    where: since ? { userId, completedAt: { gte: new Date(since) } } : { userId },
    orderBy: { completedAt: 'desc' },
  });
  return sessions.map(toPublicSession);
}

export async function createSession(userId: string, input: CreateSessionInput): Promise<PublicSession> {
  const session = await prisma.pomodoroSession.create({
    data: {
      userId,
      subject: input.subject,
      durationSeconds: input.durationSeconds,
      completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
    },
  });
  return toPublicSession(session);
}

async function findOwnedSession(userId: string, id: string): Promise<PomodoroSession> {
  const session = await prisma.pomodoroSession.findFirst({ where: { id, userId } });
  if (!session) {
    throw notFound('Session not found');
  }
  return session;
}

export async function updateSession(
  userId: string,
  id: string,
  input: UpdateSessionInput,
): Promise<PublicSession> {
  await findOwnedSession(userId, id);
  const session = await prisma.pomodoroSession.update({ where: { id }, data: input });
  return toPublicSession(session);
}

export async function deleteSession(userId: string, id: string): Promise<void> {
  await findOwnedSession(userId, id);
  await prisma.pomodoroSession.delete({ where: { id } });
}
