import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  id: string;
  subject: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

type QuizContextValue = {
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  getQuiz: (id: string) => Quiz | undefined;
};

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

const SEED_QUIZZES: Quiz[] = [
  {
    id: '1',
    subject: 'Biology',
    title: 'Cell Biology Review',
    description: 'Test your knowledge of cell structure',
    questions: [
      {
        id: '1-1',
        text: 'Which organelle contains the cell’s DNA?',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'],
        correctIndex: 1,
      },
      {
        id: '1-2',
        text: 'Which organelle is known as the powerhouse of the cell?',
        options: ['Nucleus', 'Lysosome', 'Mitochondria', 'Vacuole'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: '2',
    subject: 'Mathematics',
    title: 'Quadratic Equations Quiz',
    description: 'Practice solving quadratic equations',
    questions: [
      {
        id: '2-1',
        text: 'What is the quadratic formula used for?',
        options: [
          'Solving linear equations',
          'Solving equations of the form ax² + bx + c = 0',
          'Finding derivatives',
          'Graphing lines',
        ],
        correctIndex: 1,
      },
      {
        id: '2-2',
        text: 'In ax² + bx + c = 0, what does the discriminant b² - 4ac tell you?',
        options: [
          'The number of real solutions',
          'The value of x',
          'The slope of the line',
          'Nothing useful',
        ],
        correctIndex: 0,
      },
      {
        id: '2-3',
        text: 'How many solutions does x² - 4 = 0 have?',
        options: ['0', '1', '2', '3'],
        correctIndex: 2,
      },
    ],
  },
];

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(SEED_QUIZZES);

  const value = useMemo<QuizContextValue>(
    () => ({
      quizzes,
      addQuiz(quiz) {
        setQuizzes((prev) => [{ ...quiz, id: String(Date.now()) }, ...prev]);
      },
      getQuiz(id) {
        return quizzes.find((quiz) => quiz.id === id);
      },
    }),
    [quizzes],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizzes(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuizzes must be used within a QuizProvider');
  return ctx;
}
