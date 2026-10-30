import { z } from "zod";

export const QUESTION_TYPES = ["SINGLE", "MULTI", "TRUE_FALSE"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const QUIZ_MODES = ["EXAM", "STUDY"] as const;

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export const difficultySchema = z.enum(DIFFICULTIES);
export const quizModeSchema = z.enum(QUIZ_MODES);

export const QUESTION_COUNT_MIN = 1;
export const QUESTION_COUNT_MAX = 50;
export const OPTION_COUNT_MIN = 2;
export const OPTION_COUNT_MAX = 6;

export const quizSettingsSchema = z
  .object({
    questionCount: z
      .number()
      .int("Question count must be a whole number")
      .min(QUESTION_COUNT_MIN, `Use at least ${QUESTION_COUNT_MIN} question`)
      .max(QUESTION_COUNT_MAX, `Use at most ${QUESTION_COUNT_MAX} questions`)
      .default(10),
    difficulty: difficultySchema.default("MEDIUM"),
    questionTypes: z
      .array(questionTypeSchema)
      .min(1, "Choose at least one question type")
      .max(QUESTION_TYPES.length)
      .default(["SINGLE"]),
    language: z
      .string()
      .trim()
      .min(1, "Enter a language")
      .max(50, "Language must be 50 characters or fewer")
      .default("English"),
  })
  .superRefine((settings, ctx) => {
    if (new Set(settings.questionTypes).size !== settings.questionTypes.length) {
      ctx.addIssue({
        code: "custom",
        path: ["questionTypes"],
        message: "Question types must be unique",
      });
    }
  });

export const quizQuestionSchema = z
  .object({
    type: questionTypeSchema,
    text: z
      .string()
      .trim()
      .min(1, "Question text is required")
      .max(2000, "Question text must be 2000 characters or fewer"),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Options cannot be empty")
          .max(500, "Options must be 500 characters or fewer"),
      )
      .min(OPTION_COUNT_MIN, `Each question needs at least ${OPTION_COUNT_MIN} options`)
      .max(OPTION_COUNT_MAX, `Each question can have at most ${OPTION_COUNT_MAX} options`),
    correctAnswers: z
      .array(z.number().int("Answer indexes must be whole numbers").min(0, "Answer indexes start at 0"))
      .min(1, "Each question needs at least one correct answer")
      .max(OPTION_COUNT_MAX),
    explanation: z
      .string()
      .trim()
      .min(1)
      .max(4000)
      .nullish()
      .transform((value) => value ?? undefined),
  })
  .superRefine((question, ctx) => {
    const seenOptions = new Set<string>();
    question.options.forEach((option, index) => {
      const key = option.toLowerCase();
      if (seenOptions.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["options", index],
          message: "Options must be unique",
        });
      }
      seenOptions.add(key);
    });

    const seenAnswers = new Set<number>();
    question.correctAnswers.forEach((answer, index) => {
      if (answer >= question.options.length) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswers", index],
          message: "Correct answer index is out of range",
        });
      }
      if (seenAnswers.has(answer)) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswers", index],
          message: "Correct answer indexes must be unique",
        });
      }
      seenAnswers.add(answer);
    });

    if (question.type === "TRUE_FALSE" && question.options.length !== 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "True/false questions need exactly 2 options",
      });
    }

    if (question.type !== "MULTI" && question.correctAnswers.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswers"],
        message: "This question type needs exactly one correct answer",
      });
    }

    if (question.type === "MULTI" && question.correctAnswers.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswers"],
        message: "Multi-select questions need at least two correct answers",
      });
    }
  });

export const quizImportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required")
    .max(200, "Quiz title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .nullish()
    .transform((value) => value ?? undefined),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "The quiz needs at least one question")
    .max(QUESTION_COUNT_MAX, `The quiz can have at most ${QUESTION_COUNT_MAX} questions`),
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type QuizMode = z.infer<typeof quizModeSchema>;
export type QuizSettings = z.infer<typeof quizSettingsSchema>;
export type QuizSettingsInput = z.input<typeof quizSettingsSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizImport = z.infer<typeof quizImportSchema>;
