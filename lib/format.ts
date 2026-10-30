import type { Difficulty, QuestionType, QuizMode } from "@/lib/quiz/schemas";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE: "Single choice",
  MULTI: "Multiple select",
  TRUE_FALSE: "True / false",
};

export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  EXAM: "Exam",
  STUDY: "Study",
};

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
