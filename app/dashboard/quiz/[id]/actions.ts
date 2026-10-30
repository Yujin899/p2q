"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  attemptSubmissionSchema,
  type AttemptActionResult,
} from "@/lib/quiz/attempt";
import { scoreQuiz } from "@/lib/quiz/score";

export async function submitAttemptAction(
  input: unknown,
): Promise<AttemptActionResult> {
  const user = await requireUser();
  const submission = attemptSubmissionSchema.safeParse(input);
  if (!submission.success) {
    return {
      ok: false,
      error:
        submission.error.issues[0]?.message ?? "Check your answers and retry.",
    };
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: submission.data.quizId, userId: user.id },
    select: {
      id: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          correctAnswers: true,
        },
      },
    },
  });

  if (!quiz) {
    return { ok: false, error: "This quiz no longer exists." };
  }

  if (quiz.questions.length === 0) {
    return { ok: false, error: "This quiz has no questions to score." };
  }

  const score = scoreQuiz(
    quiz.questions,
    quiz.questions.map((question) => submission.data.answers[question.id]),
  );

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      quizId: quiz.id,
      mode: submission.data.mode,
      score: score.score,
      total: score.total,
      percentage: score.percentage,
      answers: {
        create: score.results.map((result) => ({
          questionId: quiz.questions[result.index].id,
          selected: result.selected,
          isCorrect: result.isCorrect,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath(`/dashboard/quiz/${quiz.id}`);

  return {
    ok: true,
    result: {
      attemptId: attempt.id,
      quizId: quiz.id,
      mode: submission.data.mode,
      score: score.score,
      total: score.total,
      percentage: score.percentage,
      results: score.results.map((result) => {
        const question = quiz.questions[result.index];
        return {
          questionId: question.id,
          selected: result.selected,
          correctAnswers: question.correctAnswers,
          isCorrect: result.isCorrect,
        };
      }),
    },
  };
}
