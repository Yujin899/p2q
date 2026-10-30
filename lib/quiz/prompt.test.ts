import { describe, expect, it } from "vitest";

import { buildQuizPrompt } from "./prompt";

describe("buildQuizPrompt", () => {
  it("uses the attached file as the source with the requested settings", () => {
    const prompt = buildQuizPrompt({
      questionCount: 8,
      difficulty: "HARD",
      questionTypes: ["SINGLE", "TRUE_FALSE"],
      language: "French",
    });

    expect(prompt).toContain("ONLY the attached file");
    expect(prompt).toContain("exactly 8 questions");
    expect(prompt).toContain("hard difficulty");
    expect(prompt).toContain("French");
    expect(prompt).toContain("SINGLE: multiple choice");
    expect(prompt).toContain("TRUE_FALSE: a true/false statement");
    expect(prompt).not.toContain("MULTI: multiple select");
  });

  it("keeps questions grounded in the source file", () => {
    const prompt = buildQuizPrompt({});

    expect(prompt).toContain("Do not use outside knowledge");
    expect(prompt).toContain("do not invent facts");
    expect(prompt).toContain("return fewer questions");
    expect(prompt).toContain("Avoid trick wording");
  });

  it("applies defaults", () => {
    const prompt = buildQuizPrompt({});

    expect(prompt).toContain("exactly 10 questions");
    expect(prompt).toContain("medium difficulty");
    expect(prompt).toContain("English");
    expect(prompt).toContain("SINGLE: multiple choice");
  });

  it("asks for JSON-only output with zero-based answers", () => {
    const prompt = buildQuizPrompt({});

    expect(prompt).toContain("Return ONLY a JSON object");
    expect(prompt).toContain("zero-based indexes");
    expect(prompt).toContain("Do not use markdown fences");
  });

  it("rejects invalid settings", () => {
    expect(() => buildQuizPrompt({ questionCount: 0 })).toThrow();
  });
});
