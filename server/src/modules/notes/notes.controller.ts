import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { createNoteSchema, updateNoteSchema } from './notes.validation';
import { listNotes, createNote, updateNote, deleteNote } from './notes.service';

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const notes = await listNotes(req.userId!);
  res.json(notes);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = createNoteSchema.parse(req.body);
  const note = await createNote(req.userId!, input);
  res.status(201).json(note);
}

export async function update(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = updateNoteSchema.parse(req.body);
  const note = await updateNote(req.userId!, req.params.id, input);
  res.json(note);
}

export async function remove(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  await deleteNote(req.userId!, req.params.id);
  res.status(204).send();
}
