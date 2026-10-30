import { describe, expect, it } from "vitest";

import {
  quizImportSchema,
  quizQuestionSchema,
  quizSettingsSchema,
} from "./schemas";

const singleQuestion = {
  type: "SINGLE" as const,
  text: "What is the powerhouse of the cell?",
  options: ["Nucleus", "Mitochondria", "Ribosome"],
  correctAnswers: [1],
  explanation: "Mitochondria produce most of the cell's ATP.",
};

describe("quizSettingsSchema", () => {
  it("applies defaults without requiring a topic", () => {
    const settings = quizSettingsSchema.parse({});

    expect(settings).toEqual({
      questionCount: 10,
      difficulty: "MEDIUM",
      questionTypes: ["SINGLE"],
      language: "English",
    });
  });

  it("rejects an invalid question count", () => {
    expect(quizSettingsSchema.safeParse({ questionCount: 0 }).success).toBe(
      false,
    );
  });

  it("rejects duplicate question types", () => {
    const result = quizSettingsSchema.safeParse({
      questionTypes: ["SINGLE", "SINGLE"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty question type list", () => {
    const result = quizSettingsSchema.safeParse({
      questionTypes: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("quizQuestionSchema", () => {
  it("accepts a valid single-answer question", () => {
    expect(quizQuestionSchema.safeParse(singleQuestion).success).toBe(true);
  });

  it("accepts a multi-select question with multiple correct answers", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      type: "MULTI",
      correctAnswers: [0, 1],
    });

    expect(result.success).toBe(true);
  });

  it("rejects duplicate options regardless of case", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      options: ["Mitochondria", "mitochondria"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range correct answer", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      correctAnswers: [3],
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate correct answer indexes", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      type: "MULTI",
      correctAnswers: [1, 1],
    });

    expect(result.success).toBe(false);
  });

  it("requires exactly one answer for single and true/false questions", () => {
    const single = quizQuestionSchema.safeParse({
      ...singleQuestion,
      correctAnswers: [0, 1],
    });
    const trueFalse = quizQuestionSchema.safeParse({
      ...singleQuestion,
      type: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswers: [0, 1],
    });

    expect(single.success).toBe(false);
    expect(trueFalse.success).toBe(false);
  });

  it("requires at least two answers for multi-select questions", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      type: "MULTI",
      correctAnswers: [1],
    });

    expect(result.success).toBe(false);
  });

  it("requires exactly two options for true/false questions", () => {
    const result = quizQuestionSchema.safeParse({
      ...singleQuestion,
      type: "TRUE_FALSE",
      options: ["True", "False", "Maybe"],
      correctAnswers: [0],
    });

    expect(result.success).toBe(false);
  });

  it("turns a null explanation into undefined", () => {
    const result = quizQuestionSchema.parse({
      ...singleQuestion,
      explanation: null,
    });

    expect(result.explanation).toBeUndefined();
  });
});

describe("quizImportSchema", () => {
  it("accepts a complete quiz", () => {
    const result = quizImportSchema.parse({
      title: "Cell Biology",
      questions: [singleQuestion],
    });

    expect(result.title).toBe("Cell Biology");
    expect(result.questions).toHaveLength(1);
    expect(result.description).toBeUndefined();
  });

  it("rejects an empty question list", () => {
    const result = quizImportSchema.safeParse({
      title: "Cell Biology",
      questions: [],
    });

    expect(result.success).toBe(false);
  });
});
