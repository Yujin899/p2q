import {
  quizSettingsSchema,
  type QuestionType,
  type QuizSettingsInput,
} from "./schemas";

const TYPE_RULES: Record<QuestionType, string> = {
  SINGLE: "multiple choice with exactly one correct answer (2-6 options)",
  MULTI: "multiple select with at least two correct answers (2-6 options)",
  TRUE_FALSE: "a true/false statement with exactly 2 options and one correct answer",
};

export function buildQuizPrompt(input: QuizSettingsInput): string {
  const settings = quizSettingsSchema.parse(input);
  const typeRules = settings.questionTypes
    .map((type) => `- ${type}: ${TYPE_RULES[type]}`)
    .join("\n");

  return [
    `Create a ${settings.difficulty.toLowerCase()} difficulty quiz about ${JSON.stringify(settings.topic)}.`,
    "",
    `Write exactly ${settings.questionCount} questions in ${settings.language}.`,
    "",
    "Use only these question types:",
    typeRules,
    "",
    "Return ONLY a JSON object that matches this shape:",
    "{",
    '  "title": "A short quiz title",',
    '  "description": "An optional one-sentence description",',
    '  "questions": [',
    "    {",
    '      "type": "SINGLE",',
    '      "text": "The question text",',
    '      "options": ["First option", "Second option"],',
    '      "correctAnswers": [0],',
    '      "explanation": "Why the answer is correct"',
    "    }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- correctAnswers contains zero-based indexes into the options array.",
    "- Each question has between 2 and 6 unique options.",
    "- SINGLE and TRUE_FALSE questions have exactly one correct answer.",
    "- MULTI questions have at least two correct answers.",
    "- TRUE_FALSE questions have exactly two options.",
    "- Include an explanation for every question.",
    "- Do not use markdown fences, comments, or text outside the JSON object.",
  ].join("\n");
}
