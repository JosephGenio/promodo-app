import { apiClient } from '@/api/client';

export type Note = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await apiClient.get<Note[]>('/api/notes');
  return data;
}

export async function createNote(input: {
  title: string;
  category?: string;
  content: string;
}): Promise<Note> {
  const { data } = await apiClient.post<Note>('/api/notes', input);
  return data;
}

export async function updateNote(
  id: string,
  input: Partial<{ title: string; category: string; content: string }>,
): Promise<Note> {
  const { data } = await apiClient.patch<Note>(`/api/notes/${id}`, input);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete(`/api/notes/${id}`);
}
