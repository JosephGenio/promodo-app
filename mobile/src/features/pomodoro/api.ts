import { apiClient } from '@/api/client';

export type PomodoroSession = {
  id: string;
  subject: string;
  durationSeconds: number;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchSessions(since?: string): Promise<PomodoroSession[]> {
  const { data } = await apiClient.get<PomodoroSession[]>('/api/pomodoro/sessions', {
    params: since ? { since } : undefined,
  });
  return data;
}

export async function createSession(input: {
  subject?: string;
  durationSeconds: number;
  completedAt?: string;
}): Promise<PomodoroSession> {
  const { data } = await apiClient.post<PomodoroSession>('/api/pomodoro/sessions', input);
  return data;
}

export async function updateSession(
  id: string,
  input: Partial<{ subject: string; durationSeconds: number }>,
): Promise<PomodoroSession> {
  const { data } = await apiClient.patch<PomodoroSession>(`/api/pomodoro/sessions/${id}`, input);
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(`/api/pomodoro/sessions/${id}`);
}
