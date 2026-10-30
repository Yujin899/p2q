import { describe, expect, it } from "vitest";

import { isSelectionCorrect, scoreQuiz, type ScorableQuestion } from "./score";

const single: ScorableQuestion = {
  type: "SINGLE",
  correctAnswers: [1],
};

const multi: ScorableQuestion = {
  type: "MULTI",
  correctAnswers: [0, 2],
};

describe("isSelectionCorrect", () => {
  it("accepts the exact single answer", () => {
    expect(isSelectionCorrect(single, [1])).toBe(true);
  });

  it("rejects a different single answer", () => {
    expect(isSelectionCorrect(single, [0])).toBe(false);
  });

  it("accepts multi-select answers in any order", () => {
    expect(isSelectionCorrect(multi, [2, 0])).toBe(true);
  });

  it("deduplicates selected answers", () => {
    expect(isSelectionCorrect(multi, [0, 0, 2])).toBe(true);
  });

  it("rejects a partial multi-select answer", () => {
    expect(isSelectionCorrect(multi, [0])).toBe(false);
  });

  it("rejects extra multi-select answers", () => {
    expect(isSelectionCorrect(multi, [0, 1, 2])).toBe(false);
  });

  it("rejects a missing answer", () => {
    expect(isSelectionCorrect(single, undefined)).toBe(false);
  });
});

describe("scoreQuiz", () => {
  it("scores questions and returns per-question results", () => {
    const result = scoreQuiz([single, multi], [[1], [2, 0]]);

    expect(result.score).toBe(2);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.results).toEqual([
      { index: 0, selected: [1], isCorrect: true },
      { index: 1, selected: [0, 2], isCorrect: true },
    ]);
  });

  it("rounds the percentage", () => {
    const result = scoreQuiz([single, multi, single], [[1], [0], [0]]);

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(33);
  });

  it("handles an empty quiz", () => {
    const result = scoreQuiz([], []);

    expect(result).toEqual({
      score: 0,
      total: 0,
      percentage: 0,
      results: [],
    });
  });
});
