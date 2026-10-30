import type { Difficulty, QuestionType, QuizMode } from "./schemas";

export type PlayableQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  options: string[];
  explanation: string | null;
};

export type PlayableQuiz = {
  id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty | null;
  questions: PlayableQuestion[];
};

export type QuizHistoryItem = {
  id: string;
  mode: QuizMode;
  score: number;
  total: number;
  percentage: number;
  completedAt: Date;
};

export type QuizSummary = {
  id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty | null;
  createdAt: Date;
  questionCount: number;
  attemptCount: number;
};

export type DashboardStats = {
  quizCount: number;
  attemptCount: number;
  averagePercentage: number;
};

export type RecentAttempt = {
  id: string;
  mode: QuizMode;
  score: number;
  total: number;
  percentage: number;
  completedAt: Date;
  quiz: {
    id: string;
    title: string;
  };
};
