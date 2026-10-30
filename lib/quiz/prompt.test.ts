import { describe, expect, it } from "vitest";

import { buildQuizPrompt } from "./prompt";

describe("buildQuizPrompt", () => {
  it("includes the topic, count, difficulty, and language", () => {
    const prompt = buildQuizPrompt({
      topic: "Photosynthesis",
      questionCount: 8,
      difficulty: "HARD",
      questionTypes: ["SINGLE", "TRUE_FALSE"],
      language: "French",
    });

    expect(prompt).toContain('"Photosynthesis"');
    expect(prompt).toContain("exactly 8 questions");
    expect(prompt).toContain("hard difficulty");
    expect(prompt).toContain("French");
    expect(prompt).toContain("SINGLE: multiple choice");
    expect(prompt).toContain("TRUE_FALSE: a true/false statement");
    expect(prompt).not.toContain("MULTI: multiple select");
  });

  it("applies defaults", () => {
    const prompt = buildQuizPrompt({ topic: "Space" });

    expect(prompt).toContain("exactly 10 questions");
    expect(prompt).toContain("medium difficulty");
    expect(prompt).toContain("English");
    expect(prompt).toContain("SINGLE: multiple choice");
  });

  it("asks for JSON-only output with zero-based answers", () => {
    const prompt = buildQuizPrompt({ topic: "Space" });

    expect(prompt).toContain("Return ONLY a JSON object");
    expect(prompt).toContain("zero-based indexes");
    expect(prompt).toContain("Do not use markdown fences");
  });

  it("rejects invalid settings", () => {
    expect(() => buildQuizPrompt({ topic: "  " })).toThrow();
  });
});
