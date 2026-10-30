import type { QuestionType } from "./schemas";

export type ScorableQuestion = {
  type: QuestionType;
  correctAnswers: readonly number[];
};

export type QuizAnswers = ReadonlyArray<readonly number[] | undefined>;

export type QuestionResult = {
  index: number;
  selected: number[];
  isCorrect: boolean;
};

export type QuizScore = {
  score: number;
  total: number;
  percentage: number;
  results: QuestionResult[];
};

export function normalizeSelection(
  answers: readonly number[] | undefined,
): number[] {
  return Array.from(new Set(answers ?? [])).sort((a, b) => a - b);
}

export function isSelectionCorrect(
  question: ScorableQuestion,
  selected: readonly number[] | undefined,
): boolean {
  const selectedAnswers = normalizeSelection(selected);
  const correctAnswers = normalizeSelection(question.correctAnswers);

  if (selectedAnswers.length !== correctAnswers.length) {
    return false;
  }

  return selectedAnswers.every((answer, index) => answer === correctAnswers[index]);
}

export function scoreQuiz(
  questions: readonly ScorableQuestion[],
  answers: QuizAnswers,
): QuizScore {
  const results = questions.map((question, index) => {
    const selected = normalizeSelection(answers[index]);
    return {
      index,
      selected,
      isCorrect: isSelectionCorrect(question, selected),
    };
  });

  const score = results.filter((result) => result.isCorrect).length;
  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  return { score, total, percentage, results };
}
