import { describe, expect, it } from "vitest";

import { parseQuizResponse, QuizParseError } from "./parse";

const quiz = {
  title: "Cell Biology",
  description: "A short quiz about cells.",
  questions: [
    {
      type: "SINGLE",
      text: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome"],
      correctAnswers: [1],
      explanation: "Mitochondria produce most of the cell's ATP.",
    },
  ],
};

describe("parseQuizResponse", () => {
  it("parses raw JSON", () => {
    const parsed = parseQuizResponse(JSON.stringify(quiz));

    expect(parsed.title).toBe("Cell Biology");
    expect(parsed.questions[0].text).toContain("powerhouse");
  });

  it("parses JSON inside a markdown code fence", () => {
    const input = `Here is the quiz:\n\n\`\`\`json\n${JSON.stringify(quiz)}\n\`\`\`\n`;
    const parsed = parseQuizResponse(input);

    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0].correctAnswers).toEqual([1]);
  });

  it("parses JSON surrounded by prose", () => {
    const parsed = parseQuizResponse(
      `Sure. I created this for you: ${JSON.stringify(quiz)} Let me know if you need changes.`,
    );

    expect(parsed.title).toBe("Cell Biology");
  });

  it("skips an invalid fence and uses a later valid one", () => {
    const input = [
      "```json",
      "{not valid json}",
      "```",
      "```json",
      JSON.stringify(quiz),
      "```",
    ].join("\n");

    expect(parseQuizResponse(input).title).toBe("Cell Biology");
  });

  it("turns the schema output into normalized values", () => {
    const parsed = parseQuizResponse(
      JSON.stringify({
        ...quiz,
        title: "  Cell Biology  ",
        description: null,
      }),
    );

    expect(parsed.title).toBe("Cell Biology");
    expect(parsed.description).toBeUndefined();
  });

  it("rejects empty input", () => {
    expect(() => parseQuizResponse("   ")).toThrow(QuizParseError);
    expect(() => parseQuizResponse("   ")).toThrow(/Paste the JSON/);
  });

  it("reports the problem when no JSON is present", () => {
    expect(() => parseQuizResponse("I cannot help with that.")).toThrow(
      /No valid JSON found/,
    );
  });

  it("reports schema issues with their path", () => {
    const invalid = {
      ...quiz,
      questions: [{ ...quiz.questions[0], correctAnswers: [9] }],
    };

    expect(() => parseQuizResponse(JSON.stringify(invalid))).toThrow(
      /questions\.0\.correctAnswers\.0: Correct answer index is out of range/,
    );
  });
});
