"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { cn } from "cn";

import { submitAttemptAction } from "@/app/dashboard/quiz/[id]/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUIZ_MODE_LABELS,
  formatDate,
  formatPercentage,
  pluralize,
} from "@/lib/format";
import type { AttemptResult } from "@/lib/quiz/attempt";
import type { PlayableQuiz, QuizHistoryItem } from "@/lib/quiz/play";
import {
  QUIZ_MODES,
  type QuizMode,
} from "@/lib/quiz/schemas";

export function QuizRunner({
  quiz,
  history,
}: {
  quiz: PlayableQuiz;
  history: QuizHistoryItem[];
}) {
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<QuizMode>("EXAM");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = quiz.questions.length;
  const answeredCount = quiz.questions.filter(
    (question) => (answers[question.id]?.length ?? 0) > 0,
  ).length;
  const unansweredCount = total - answeredCount;
  const answeredPercentage =
    total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  const resultByQuestion = result
    ? new Map(result.results.map((item) => [item.questionId, item]))
    : null;

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  function selectSingle(questionId: string, optionIndex: number) {
    if (result) {
      return;
    }

    setAnswers((current) => ({ ...current, [questionId]: [optionIndex] }));
  }

  function toggleMulti(questionId: string, optionIndex: number) {
    if (result) {
      return;
    }

    setAnswers((current) => {
      const selected = current[questionId] ?? [];
      const next = selected.includes(optionIndex)
        ? selected.filter((index) => index !== optionIndex)
        : [...selected, optionIndex].sort((a, b) => a - b);

      return { ...current, [questionId]: next };
    });
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await submitAttemptAction({
          quizId: quiz.id,
          mode,
          answers,
        });

        if (!response.ok) {
          setError(response.error);
          return;
        }

        setResult(response.result);
        router.refresh();
      } catch {
        setError("Could not save your attempt. Please try again.");
      }
    });
  }

  function retake() {
    setResult(null);
    setAnswers({});
    setError(null);
    setMode("EXAM");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to library
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {quiz.difficulty ? (
            <Badge variant="outline">
              {DIFFICULTY_LABELS[quiz.difficulty]}
            </Badge>
          ) : null}
          <Badge variant="ghost">
            {pluralize(total, "question")}
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl leading-none tracking-tight sm:text-4xl">
            {quiz.title}
          </h1>
          {quiz.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {quiz.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-sm border p-0.5">
            {QUIZ_MODES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                disabled={pending || Boolean(result)}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  mode === option
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {QUIZ_MODE_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="min-w-48 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {answeredCount} of {total} answered
              </span>
              <span>{answeredPercentage}%</span>
            </div>
            <Progress value={answeredPercentage} max={100} />
          </div>
        </div>
      </div>

      {result ? (
        <div ref={resultRef}>
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{QUIZ_MODE_LABELS[result.mode]} result</Badge>
                <Badge variant="outline">
                  {pluralize(result.total, "question")}
                </Badge>
              </div>
              <CardTitle className="font-serif text-3xl">
                {formatPercentage(result.percentage)}
              </CardTitle>
              <CardDescription>
                You answered {result.score} of {result.total} questions
                correctly. This attempt was saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={result.percentage} max={100} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={retake} variant="outline">
                  <RotateCcw />
                  Retake quiz
                </Button>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Back to dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {quiz.questions.map((question, questionIndex) => {
          const selected = answers[question.id] ?? [];
          const questionResult = resultByQuestion?.get(question.id);
          const disabled = pending || Boolean(result);
          const correctOptionIndexes = questionResult?.correctAnswers ?? [];

          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Question {questionIndex + 1} of {total}
                  </span>
                  <Badge variant="outline">
                    {QUESTION_TYPE_LABELS[question.type]}
                  </Badge>
                  {questionResult ? (
                    <Badge
                      variant={
                        questionResult.isCorrect ? "secondary" : "destructive"
                      }
                    >
                      {questionResult.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-base leading-relaxed">
                  {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const checked = selected.includes(optionIndex);
                    const isCorrectOption =
                      correctOptionIndexes.includes(optionIndex);
                    const isSelectedWrong =
                      Boolean(questionResult) && checked && !isCorrectOption;

                    return (
                      <label
                        key={optionIndex}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-sm border p-3 text-sm transition-colors",
                          checked && !questionResult && "paper-option-selected",
                          questionResult &&
                            isCorrectOption &&
                            "paper-option-correct",
                          questionResult &&
                            isSelectedWrong &&
                            "paper-option-wrong",
                          disabled && "cursor-default",
                        )}
                      >
                        <input
                          type={
                            question.type === "MULTI" ? "checkbox" : "radio"
                          }
                          name={`question-${question.id}`}
                          checked={checked}
                          disabled={disabled}
                          onChange={() =>
                            question.type === "MULTI"
                              ? toggleMulti(question.id, optionIndex)
                              : selectSingle(question.id, optionIndex)
                          }
                          className="mt-0.5 size-4 accent-primary"
                        />
                        <span className="flex-1">{option}</span>
                        {questionResult && isCorrectOption ? (
                          <CheckCircle2 className="mt-0.5 size-4 text-[var(--paper-success)]" />
                        ) : null}
                        {questionResult && isSelectedWrong ? (
                          <XCircle className="mt-0.5 size-4 text-destructive" />
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {questionResult && !questionResult.isCorrect ? (
                  <p className="text-xs text-muted-foreground">
                    Correct answer:{" "}
                    {questionResult.correctAnswers
                      .map((index) => question.options[index])
                      .join(", ")}
                  </p>
                ) : null}

                {result && mode === "STUDY" && question.explanation ? (
                  <p className="paper-callout p-3 text-sm leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!result ? (
        <div className="paper-callout flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {unansweredCount === 0
              ? "All questions answered."
              : `${pluralize(unansweredCount, "question")} still unanswered.`}
          </p>
          <Button type="button" onClick={submit} disabled={pending || total === 0}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? "Scoring..." : "Submit attempt"}
          </Button>
        </div>
      ) : null}

      {history.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Recent attempts</CardTitle>
            <CardDescription>
              Your last {history.length === 1 ? "attempt" : `${history.length} attempts`} on this quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {history.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between gap-3 rounded-sm border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {QUIZ_MODE_LABELS[attempt.mode]}
                  </Badge>
                  <span className="text-muted-foreground">
                    {attempt.score}/{attempt.total} correct
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(attempt.completedAt)}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPercentage(attempt.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
