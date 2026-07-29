import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as quizApi from '@/features/quiz/api';
import type { QuizDetail, QuizListItem, QuizQuestion } from '@/features/quiz/api';

export type { QuizDetail, QuizListItem, QuizQuestion };

type NewQuiz = {
  subject: string;
  title: string;
  description: string;
  questions: Omit<QuizQuestion, 'id'>[];
};

type QuizContextValue = {
  quizzes: QuizListItem[];
  isLoading: boolean;
  error: boolean;
  refresh: () => void;
  addQuiz: (quiz: NewQuiz) => Promise<QuizDetail>;
  getQuiz: (id: string) => Promise<QuizDetail>;
};

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(false);
    quizApi
      .fetchQuizzes()
      .then(setQuizzes)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(refresh, [refresh]);

  const value = useMemo<QuizContextValue>(
    () => ({
      quizzes,
      isLoading,
      error,
      refresh,
      async addQuiz(quiz) {
        const created = await quizApi.createQuiz(quiz);
        setQuizzes((prev) => [
          {
            id: created.id,
            subject: created.subject,
            title: created.title,
            description: created.description,
            questionCount: created.questions.length,
          },
          ...prev,
        ]);
        return created;
      },
      getQuiz(id) {
        return quizApi.fetchQuiz(id);
      },
    }),
    [quizzes, isLoading, error, refresh],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizzes(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuizzes must be used within a QuizProvider');
  return ctx;
}
