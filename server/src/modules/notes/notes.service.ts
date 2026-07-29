import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import type { Note } from '../../generated/prisma/client';
import type { CreateNoteInput, UpdateNoteInput } from './notes.validation';

export type PublicNote = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicNote(note: Note): PublicNote {
  return {
    id: note.id,
    title: note.title,
    category: note.category,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function listNotes(userId: string): Promise<PublicNote[]> {
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return notes.map(toPublicNote);
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<PublicNote> {
  const note = await prisma.note.create({
    data: { userId, title: input.title, category: input.category, content: input.content },
  });
  return toPublicNote(note);
}

async function findOwnedNote(userId: string, id: string): Promise<Note> {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) {
    throw notFound('Note not found');
  }
  return note;
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput): Promise<PublicNote> {
  await findOwnedNote(userId, id);
  const note = await prisma.note.update({ where: { id }, data: input });
  return toPublicNote(note);
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  await findOwnedNote(userId, id);
  await prisma.note.delete({ where: { id } });
}
