import { z } from "zod";

import { quizModeSchema, type QuizMode } from "./schemas";

export const attemptSubmissionSchema = z.object({
  quizId: z.string().trim().min(1),
  mode: quizModeSchema,
  answers: z.record(
    z.string(),
    z.array(z.number().int().min(0)).max(6),
  ),
});

export type AttemptSubmission = z.infer<typeof attemptSubmissionSchema>;

export type AttemptQuestionResult = {
  questionId: string;
  selected: number[];
  correctAnswers: number[];
  isCorrect: boolean;
};

export type AttemptResult = {
  attemptId: string;
  quizId: string;
  mode: QuizMode;
  score: number;
  total: number;
  percentage: number;
  results: AttemptQuestionResult[];
};

export type AttemptActionResult =
  | { ok: true; result: AttemptResult }
  | { ok: false; error: string };
