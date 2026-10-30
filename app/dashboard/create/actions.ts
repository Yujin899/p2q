"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { parseQuizResponse } from "@/lib/quiz/parse";
import { quizSettingsSchema } from "@/lib/quiz/schemas";

export type ImportQuizState = {
  error: string | null;
  quizId: string | null;
};

export async function importQuizAction(
  _previousState: ImportQuizState,
  formData: FormData,
): Promise<ImportQuizState> {
  const user = await requireUser();
  const rawCount = formData.get("questionCount");
  const settingsResult = quizSettingsSchema.safeParse({
    topic: formData.get("topic"),
    questionCount: rawCount === null ? undefined : Number(rawCount),
    difficulty: formData.get("difficulty") ?? undefined,
    questionTypes: formData.getAll("questionTypes"),
    language: formData.get("language") ?? undefined,
  });

  if (!settingsResult.success) {
    return {
      error:
        settingsResult.error.issues[0]?.message ??
        "Check the quiz settings and try again.",
      quizId: null,
    };
  }

  let quiz;
  try {
    quiz = parseQuizResponse(String(formData.get("response") ?? ""));
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not parse the quiz response.",
      quizId: null,
    };
  }

  const settings = settingsResult.data;
  let created: { id: string };

  try {
    created = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: settings.difficulty,
        language: settings.language,
        settings,
        questions: {
          create: quiz.questions.map((question, index) => ({
            order: index + 1,
            type: question.type,
            text: question.text,
            options: question.options,
            correctAnswers: question.correctAnswers,
            explanation: question.explanation,
          })),
        },
      },
      select: { id: true },
    });
  } catch {
    return {
      error: "Could not save the quiz. Check the database and try again.",
      quizId: null,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");

  return { error: null, quizId: created.id };
}
