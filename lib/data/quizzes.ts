import "server-only";

import { cache } from "react";

import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type {
  DashboardStats,
  PlayableQuiz,
  QuizHistoryItem,
  QuizSummary,
  RecentAttempt,
} from "@/lib/quiz/play";

export const getQuizzes = cache(async (): Promise<QuizSummary[]> => {
  const user = await requireUser();
  const quizzes = await prisma.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      createdAt: true,
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  return quizzes.map(({ _count, ...quiz }) => ({
    ...quiz,
    questionCount: _count.questions,
    attemptCount: _count.attempts,
  }));
});

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const user = await requireUser();
  const where = { userId: user.id };
  const [quizCount, attemptCount, attempts] = await Promise.all([
    prisma.quiz.count({ where }),
    prisma.attempt.count({ where }),
    prisma.attempt.aggregate({ where, _avg: { percentage: true } }),
  ]);

  return {
    quizCount,
    attemptCount,
    averagePercentage: Math.round(attempts._avg.percentage ?? 0),
  };
});

export const getRecentAttempts = cache(
  async (limit = 5): Promise<RecentAttempt[]> => {
    const user = await requireUser();

    return prisma.attempt.findMany({
      where: { userId: user.id },
      take: limit,
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        mode: true,
        score: true,
        total: true,
        percentage: true,
        completedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },
);

export const getQuizForPlay = cache(
  async (id: string): Promise<PlayableQuiz | null> => {
    const user = await requireUser();

    return prisma.quiz.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            type: true,
            text: true,
            options: true,
            explanation: true,
          },
        },
      },
    });
  },
);

export const getQuizHistory = cache(
  async (quizId: string): Promise<QuizHistoryItem[]> => {
    const user = await requireUser();

    return prisma.attempt.findMany({
      where: { quizId, userId: user.id },
      take: 5,
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        mode: true,
        score: true,
        total: true,
        percentage: true,
        completedAt: true,
      },
    });
  },
);
