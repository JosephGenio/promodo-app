import { apiClient } from '@/api/client';

export type Todo = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchTodos(): Promise<Todo[]> {
  const { data } = await apiClient.get<Todo[]>('/api/todo');
  return data;
}

export async function createTodo(input: { title: string; description?: string }): Promise<Todo> {
  const { data } = await apiClient.post<Todo>('/api/todo', input);
  return data;
}

export async function updateTodo(
  id: string,
  input: Partial<{ title: string; description: string; done: boolean }>,
): Promise<Todo> {
  const { data } = await apiClient.patch<Todo>(`/api/todo/${id}`, input);
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/api/todo/${id}`);
}
