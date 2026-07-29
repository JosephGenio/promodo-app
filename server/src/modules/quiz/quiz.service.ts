import { prisma } from '../../lib/prisma';
import { notFound, badRequest } from '../../lib/errors';
import type { Quiz, Question, QuizAttempt } from '../../generated/prisma/client';
import type { CreateQuizInput, UpdateQuizInput } from './quiz.validation';

export type PublicQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type PublicQuizListItem = {
  id: string;
  subject: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicQuizDetail = PublicQuizListItem & {
  questions: PublicQuestion[];
};

export type PublicAttempt = {
  id: string;
  quizId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  percent: number;
  completedAt: Date;
};

function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
  };
}

function toPublicAttempt(attempt: QuizAttempt): PublicAttempt {
  return {
    id: attempt.id,
    quizId: attempt.quizId,
    answers: attempt.answers,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percent: attempt.percent,
    completedAt: attempt.completedAt,
  };
}

type QuizWithCount = Quiz & { _count: { questions: number } };

function toPublicQuizListItem(quiz: QuizWithCount): PublicQuizListItem {
  return {
    id: quiz.id,
    subject: quiz.subject,
    title: quiz.title,
    description: quiz.description,
    questionCount: quiz._count.questions,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

type QuizWithQuestions = Quiz & { questions: Question[] };

function toPublicQuizDetail(quiz: QuizWithQuestions): PublicQuizDetail {
  return {
    id: quiz.id,
    subject: quiz.subject,
    title: quiz.title,
    description: quiz.description,
    questionCount: quiz.questions.length,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    questions: quiz.questions.map(toPublicQuestion),
  };
}

export async function listQuizzes(userId: string): Promise<PublicQuizListItem[]> {
  const quizzes = await prisma.quiz.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true } } },
  });
  return quizzes.map(toPublicQuizListItem);
}

export async function createQuiz(userId: string, input: CreateQuizInput): Promise<PublicQuizDetail> {
  const quiz = await prisma.quiz.create({
    data: {
      userId,
      subject: input.subject,
      title: input.title,
      description: input.description,
      questions: {
        create: input.questions.map((q, order) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          order,
        })),
      },
    },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  return toPublicQuizDetail(quiz);
}

async function findOwnedQuiz(userId: string, id: string): Promise<Quiz> {
  const quiz = await prisma.quiz.findFirst({ where: { id, userId } });
  if (!quiz) {
    throw notFound('Quiz not found');
  }
  return quiz;
}

export async function getQuizById(userId: string, id: string): Promise<PublicQuizDetail> {
  const quiz = await prisma.quiz.findFirst({
    where: { id, userId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  if (!quiz) {
    throw notFound('Quiz not found');
  }
  return toPublicQuizDetail(quiz);
}

export async function updateQuiz(userId: string, id: string, input: UpdateQuizInput): Promise<PublicQuizDetail> {
  await findOwnedQuiz(userId, id);

  const quiz = await prisma.$transaction(async (tx) => {
    await tx.quiz.update({
      where: { id },
      data: {
        subject: input.subject,
        title: input.title,
        description: input.description,
      },
    });

    if (input.questions) {
      await tx.question.deleteMany({ where: { quizId: id } });
      await tx.question.createMany({
        data: input.questions.map((q, order) => ({
          quizId: id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          order,
        })),
      });
    }

    return tx.quiz.findFirstOrThrow({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  });

  return toPublicQuizDetail(quiz);
}

export async function deleteQuiz(userId: string, id: string): Promise<void> {
  await findOwnedQuiz(userId, id);
  await prisma.quiz.delete({ where: { id } });
}

export async function submitAttempt(userId: string, quizId: string, answers: number[]): Promise<PublicAttempt> {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  if (!quiz) {
    throw notFound('Quiz not found');
  }

  if (answers.length !== quiz.questions.length) {
    throw badRequest('answers length must match the number of questions');
  }

  const score = quiz.questions.filter((question, index) => question.correctIndex === answers[index]).length;
  const totalQuestions = quiz.questions.length;
  const percent = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, userId, answers, score, totalQuestions, percent },
  });
  return toPublicAttempt(attempt);
}

export async function listAttempts(userId: string, quizId: string): Promise<PublicAttempt[]> {
  await findOwnedQuiz(userId, quizId);
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, userId },
    orderBy: { completedAt: 'desc' },
  });
  return attempts.map(toPublicAttempt);
}
