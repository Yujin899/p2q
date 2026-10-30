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
  const difficulty = settings.difficulty.toLowerCase();
  const typeRules = settings.questionTypes
    .map((type) => `- ${type}: ${TYPE_RULES[type]}`)
    .join("\n");

  return [
    "Create a quiz using ONLY the attached file as the source material.",
    "",
    `Write exactly ${settings.questionCount} questions in ${settings.language} with ${difficulty} difficulty.`,
    "",
    "Source rules:",
    "- Base every question, answer, and explanation only on the attached file.",
    "- Do not use outside knowledge and do not invent facts.",
    "- Focus on the most important concepts and skip trivial details.",
    "- If the file does not contain enough reliable material, return fewer questions instead of making things up.",
    "",
    "Question quality:",
    "- Make each question self-contained, specific, and unambiguous.",
    "- Cover different parts of the file without repeating or overlapping questions.",
    "- Use plausible distractors that are clearly incorrect.",
    "- Avoid trick wording, unnecessary negatives, and \"all of the above\" or \"none of the above\" options.",
    "- Vary the position of correct answers instead of favoring one option index.",
    "- Write an explanation for every question that references or summarizes the relevant part of the file.",
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
    "JSON rules:",
    "- correctAnswers contains zero-based indexes into the options array.",
    "- Each question has between 2 and 6 unique options.",
    "- SINGLE and TRUE_FALSE questions have exactly one correct answer.",
    "- MULTI questions have at least two correct answers.",
    '- TRUE_FALSE questions have exactly two options: "True" and "False".',
    "- Use exactly the requested question types, and include every selected type at least once when possible.",
    "- Do not use markdown fences, comments, or text outside the JSON object.",
  ].join("\n");
}
