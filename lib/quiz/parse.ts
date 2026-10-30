import { z } from "zod";

import { quizImportSchema, type QuizImport } from "./schemas";

export class QuizParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizParseError";
  }
}

function extractJsonCandidates(input: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      candidates.push(trimmed);
    }
  };

  for (const match of input.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    add(match[1]);
  }

  add(input);

  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start !== -1 && end > start) {
    add(input.slice(start, end + 1));
  }

  return candidates;
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "quiz";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function parseQuizResponse(input: string): QuizImport {
  if (input.trim().length === 0) {
    throw new QuizParseError("Paste the JSON response from the AI.");
  }

  let validationError: z.ZodError | undefined;

  for (const candidate of extractJsonCandidates(input)) {
    let value: unknown;
    try {
      value = JSON.parse(candidate);
    } catch {
      continue;
    }

    const result = quizImportSchema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    validationError ??= result.error;
  }

  if (validationError) {
    throw new QuizParseError(
      `The quiz JSON is invalid. ${formatIssues(validationError)}`,
    );
  }

  throw new QuizParseError(
    "No valid JSON found. Paste the full JSON response from the AI.",
  );
}
