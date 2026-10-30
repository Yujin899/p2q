"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  ExternalLink,
  FileJson,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
} from "lucide-react";

import {
  importQuizAction,
  type ImportQuizState,
} from "@/app/dashboard/create/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildQuizPrompt } from "@/lib/quiz/prompt";
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  type Difficulty,
  type QuestionType,
  type QuizSettings,
} from "@/lib/quiz/schemas";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/lib/format";

const INITIAL_STATE: ImportQuizState = { error: null, quizId: null };
const PROMPT_DELAY = 1500;

const DEFAULT_SETTINGS: QuizSettings = {
  topic: "",
  questionCount: 10,
  difficulty: "MEDIUM",
  questionTypes: ["SINGLE"],
  language: "English",
};

type PromptPhase = "idle" | "loading" | "ready" | "stale";

type PromptMeta = {
  questionCount: number;
  difficulty: Difficulty;
  language: string;
};

const IMPORT_STEPS = ["Parse", "Validate", "Save"] as const;

function PromptLoader() {
  return (
    <div className="paper-prompt-loader" role="status">
      <div className="paper-loader-row">
        <div className="paper-stack" aria-hidden="true">
          <span />
          <span />
          <span>
            <Sparkles />
          </span>
        </div>
        <div>
          <p className="paper-loader-title">
            Creating your prompt
            <span className="paper-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </p>
          <p className="paper-loader-sub">
            Shaping your settings into a clear quiz brief.
          </p>
        </div>
      </div>
      <div className="paper-ruled-lines" aria-hidden="true">
        <span style={{ width: "92%" }} />
        <span style={{ width: "78%" }} />
        <span style={{ width: "86%" }} />
        <span style={{ width: "54%" }} />
      </div>
      <div className="paper-ink-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function PromptIdle() {
  return (
    <div className="paper-prompt-idle">
      <div>
        <div className="paper-idle-sheet" aria-hidden="true">
          <FileText />
        </div>
        <p>
          <strong>Your prompt will appear here</strong>
          Add a topic, then generate a ready-to-paste quiz brief.
        </p>
      </div>
    </div>
  );
}

function ImportOverlay({ step }: { step: number }) {
  return (
    <div className="paper-import-overlay" role="status" aria-live="polite">
      <div className="paper-overlay-inner">
        <div className="paper-bind-loader" aria-hidden="true">
          <span className="paper-bind-core">
            <FileJson />
          </span>
        </div>
        <p className="paper-overlay-title">
          Creating your quiz
          <span className="paper-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </p>
        <p className="paper-overlay-sub">
          Reading the response and binding the questions together.
        </p>
        <div className="paper-bind-steps">
          {IMPORT_STEPS.map((label, index) => (
            <span
              key={label}
              data-active={index === step}
              data-done={index < step}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportSuccess({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="paper-import-success" role="status" aria-live="polite">
      <div className="paper-overlay-inner">
        <div className="paper-stamp" aria-hidden="true">
          <span>Saved</span>
        </div>
        <p className="paper-success-title">Quiz created</p>
        <p className="paper-success-sub">Taking you to your new quiz...</p>
        <Button type="button" size="sm" onClick={onOpen}>
          Open quiz
          <ExternalLink />
        </Button>
      </div>
    </div>
  );
}

export function CreateQuizForm() {
  const [state, formAction, pending] = useActionState(
    importQuizAction,
    INITIAL_STATE,
  );
  const router = useRouter();
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [promptPhase, setPromptPhase] = useState<PromptPhase>("idle");
  const [promptText, setPromptText] = useState("");
  const [promptMeta, setPromptMeta] = useState<PromptMeta>({
    questionCount: DEFAULT_SETTINGS.questionCount,
    difficulty: DEFAULT_SETTINGS.difficulty,
    language: DEFAULT_SETTINGS.language,
  });
  const [promptError, setPromptError] = useState<string | null>(null);
  const [importStep, setImportStep] = useState(0);
  const [overlayHold, setOverlayHold] = useState(false);
  const promptTimerRef = useRef<number | null>(null);
  const promptDirtyRef = useRef(false);
  const previousSettingsRef = useRef(settings);
  const navigatedQuizIdRef = useRef<string | null>(null);

  const importSucceeded = Boolean(state.quizId);
  const overlayActive = (pending || overlayHold) && !importSucceeded;

  useEffect(() => {
    if (previousSettingsRef.current === settings) {
      return;
    }

    previousSettingsRef.current = settings;
    promptDirtyRef.current = true;
    setPromptPhase((phase) => (phase === "ready" ? "stale" : phase));
  }, [settings]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    return () => {
      if (promptTimerRef.current !== null) {
        window.clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!overlayActive) {
      return;
    }

    const timers = [
      window.setTimeout(() => setImportStep(1), 550),
      window.setTimeout(() => setImportStep(2), 1100),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [overlayActive]);

  useEffect(() => {
    if (!overlayHold || pending || importSucceeded) {
      return;
    }

    const timeout = window.setTimeout(() => setOverlayHold(false), 1250);
    return () => window.clearTimeout(timeout);
  }, [importSucceeded, overlayHold, pending]);

  useEffect(() => {
    const quizId = state.quizId;

    if (!quizId || navigatedQuizIdRef.current === quizId) {
      return;
    }

    navigatedQuizIdRef.current = quizId;
    const timeout = window.setTimeout(() => {
      router.push(`/dashboard/quiz/${quizId}`);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [router, state.quizId]);

  function toggleType(type: QuestionType) {
    setSettings((current) => {
      const selected = current.questionTypes.includes(type);

      if (selected && current.questionTypes.length === 1) {
        return current;
      }

      return {
        ...current,
        questionTypes: selected
          ? current.questionTypes.filter((item) => item !== type)
          : [...current.questionTypes, type],
      };
    });
  }

  function generatePrompt() {
    try {
      const nextPrompt = buildQuizPrompt(settings);

      setPromptText(nextPrompt);
      setPromptMeta({
        questionCount: settings.questionCount,
        difficulty: settings.difficulty,
        language: settings.language,
      });
      setPromptError(null);
      setCopied(false);
      promptDirtyRef.current = false;
      setPromptPhase("loading");

      if (promptTimerRef.current !== null) {
        window.clearTimeout(promptTimerRef.current);
      }

      promptTimerRef.current = window.setTimeout(() => {
        setPromptPhase(promptDirtyRef.current ? "stale" : "ready");
        promptTimerRef.current = null;
      }, PROMPT_DELAY);
    } catch (error) {
      setPromptError(
        error instanceof Error ? error.message : "Could not build the prompt.",
      );
      setPromptPhase("idle");
    }
  }

  async function copyPrompt() {
    if (promptPhase !== "ready" || !promptText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
    } catch (error) {
      void error;
      setCopied(false);
    }
  }

  function openQuiz() {
    if (state.quizId) {
      router.push(`/dashboard/quiz/${state.quizId}`);
    }
  }

  const promptVisible = promptPhase === "ready" || promptPhase === "stale";
  const generateLabel =
    promptPhase === "loading"
      ? "Creating prompt..."
      : promptPhase === "ready"
        ? "Regenerate prompt"
        : promptPhase === "stale"
          ? "Update prompt"
          : "Generate prompt";

  return (
    <form
      action={formAction}
      onSubmit={() => {
        setImportStep(0);
        setOverlayHold(true);
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="paper-step-number">01</span>
            <div className="min-w-0 flex-1">
              <CardTitle>Quiz settings</CardTitle>
              <CardDescription>
                These settings shape the prompt you will paste into your AI
                tool.
              </CardDescription>
            </div>
            <span className="paper-corner-note hidden sm:block">draft</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              name="topic"
              required
              maxLength={200}
              value={settings.topic}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
              placeholder="e.g. The water cycle for middle school"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="questionCount">Questions</Label>
              <Input
                id="questionCount"
                name="questionCount"
                type="number"
                required
                min={1}
                max={50}
                value={
                  settings.questionCount === 0 ? "" : settings.questionCount
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    questionCount:
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                className="h-9 w-full rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={settings.difficulty}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    difficulty: event.target.value as Difficulty,
                  }))
                }
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {DIFFICULTY_LABELS[difficulty]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                required
                maxLength={50}
                value={settings.language}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    language: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Question types</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {QUESTION_TYPES.map((type) => (
                <label key={type} className="paper-type-pill">
                  <input
                    type="checkbox"
                    name="questionTypes"
                    value={type}
                    checked={settings.questionTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="size-3.5 accent-primary"
                  />
                  {QUESTION_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="paper-step-number">02</span>
            <div className="min-w-0 flex-1">
              <CardTitle>Generate the prompt</CardTitle>
              <CardDescription>
                Copy this prompt into ChatGPT, Claude, or another AI tool.
              </CardDescription>
            </div>
            <span className="paper-corner-note hidden sm:block">brief</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="paper-prompt-stage"
            data-state={promptPhase}
            aria-busy={promptPhase === "loading"}
            aria-live="polite"
          >
            {promptPhase === "idle" ? <PromptIdle /> : null}
            {promptPhase === "loading" ? <PromptLoader /> : null}
            {promptVisible ? (
              <div className="paper-prompt-result">
                <div className="paper-prompt-paper">
                  <div className="paper-prompt-meta">
                    <span>
                      {promptMeta.questionCount} questions /{" "}
                      {DIFFICULTY_LABELS[promptMeta.difficulty]}
                    </span>
                    <span
                      className={
                        promptPhase === "stale"
                          ? "text-[var(--paper-accent)]"
                          : undefined
                      }
                    >
                      {promptPhase === "stale"
                        ? "Needs update"
                        : promptMeta.language}
                    </span>
                  </div>
                  <pre className="paper-prompt-text" tabIndex={0}>
                    {promptText}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
          {promptError ? (
            <Alert variant="destructive">
              <AlertDescription>{promptError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="paper-foot-note">
            <PenLine className="size-3" />
            {promptPhase === "stale"
              ? "Settings changed. Update the brief."
              : "Edits mark the brief as stale."}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={copyPrompt}
              disabled={promptPhase !== "ready"}
              variant="outline"
              size="sm"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy prompt"}
            </Button>
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Open ChatGPT
              <ExternalLink />
            </a>
            <Button
              type="button"
              onClick={generatePrompt}
              disabled={
                settings.topic.trim().length === 0 ||
                promptPhase === "loading"
              }
              size="sm"
            >
              {promptPhase === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {generateLabel}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="paper-step-number">03</span>
            <div className="min-w-0 flex-1">
              <CardTitle>Paste the response</CardTitle>
              <CardDescription>
                Paste the AI response as-is. Markdown fences are handled
                automatically.
              </CardDescription>
            </div>
            <span className="paper-corner-note hidden sm:block">import</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="response" className="sr-only">
            AI response
          </Label>
          <div className="paper-import-stage">
            <Textarea
              id="response"
              name="response"
              required
              rows={8}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              readOnly={overlayActive || importSucceeded}
              placeholder='Paste the JSON response here, e.g. { "title": "...", "questions": [...] }'
              className="paper-import-textarea"
            />
            {overlayActive ? <ImportOverlay step={importStep} /> : null}
            {importSucceeded ? <ImportSuccess onOpen={openQuiz} /> : null}
          </div>
          {state.error && !overlayActive ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="justify-between">
          <span className="paper-foot-note hidden sm:inline-flex">
            <FileJson className="size-3" />
            Answer keys stay server-side
          </span>
          <Button
            type="submit"
            disabled={overlayActive || importSucceeded || !promptText}
          >
            {overlayActive ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileJson />
            )}
            {overlayActive ? "Creating quiz..." : "Import quiz"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
