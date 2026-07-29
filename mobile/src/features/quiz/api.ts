import { apiClient } from '@/api/client';

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type QuizListItem = {
  id: string;
  subject: string;
  title: string;
  description: string;
  questionCount: number;
};

export type QuizDetail = QuizListItem & {
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  percent: number;
  completedAt: string;
};

export async function fetchQuizzes(): Promise<QuizListItem[]> {
  const { data } = await apiClient.get<QuizListItem[]>('/api/quiz');
  return data;
}

export async function fetchQuiz(id: string): Promise<QuizDetail> {
  const { data } = await apiClient.get<QuizDetail>(`/api/quiz/${id}`);
  return data;
}

export async function createQuiz(input: {
  subject: string;
  title: string;
  description?: string;
  questions: Omit<QuizQuestion, 'id'>[];
}): Promise<QuizDetail> {
  const { data } = await apiClient.post<QuizDetail>('/api/quiz', input);
  return data;
}

export async function deleteQuiz(id: string): Promise<void> {
  await apiClient.delete(`/api/quiz/${id}`);
}

export async function submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
  const { data } = await apiClient.post<QuizAttempt>(`/api/quiz/${quizId}/attempts`, { answers });
  return data;
}

export async function fetchAttempts(quizId: string): Promise<QuizAttempt[]> {
  const { data } = await apiClient.get<QuizAttempt[]>(`/api/quiz/${quizId}/attempts`);
  return data;
}
