import { apiClient } from '@/api/client';

export type Reflection = {
  id: string;
  date: string;
  subject: string;
  learned: string;
  challenges: string;
  productivity: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchReflections(): Promise<Reflection[]> {
  const { data } = await apiClient.get<Reflection[]>('/api/reflection');
  return data;
}

export async function createReflection(input: {
  subject: string;
  learned?: string;
  challenges?: string;
  productivity?: number;
}): Promise<Reflection> {
  const { data } = await apiClient.post<Reflection>('/api/reflection', input);
  return data;
}

export async function updateReflection(
  id: string,
  input: Partial<{ subject: string; learned: string; challenges: string; productivity: number }>,
): Promise<Reflection> {
  const { data } = await apiClient.patch<Reflection>(`/api/reflection/${id}`, input);
  return data;
}

export async function deleteReflection(id: string): Promise<void> {
  await apiClient.delete(`/api/reflection/${id}`);
}
