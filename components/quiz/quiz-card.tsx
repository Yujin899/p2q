import Link from "next/link";
import { ArrowRight, ListChecks, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DIFFICULTY_LABELS, formatDate, pluralize } from "@/lib/format";
import type { QuizSummary } from "@/lib/quiz/play";

export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const quizHref = `/dashboard/quiz/${quiz.id}`;

  return (
    <Card size="sm" className="h-full transition-transform hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="pr-24">
          <Link href={quizHref} className="hover:underline">
            {quiz.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {quiz.description ?? "No description provided."}
        </CardDescription>
        <CardAction className="flex items-center gap-1.5">
          {quiz.difficulty ? (
            <Badge variant="outline">
              {DIFFICULTY_LABELS[quiz.difficulty]}
            </Badge>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-3.5" />
          {pluralize(quiz.questionCount, "question")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <RotateCcw className="size-3.5" />
          {pluralize(quiz.attemptCount, "attempt")}
        </span>
        <span>{formatDate(quiz.createdAt)}</span>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-2">
        <span className="text-xs text-muted-foreground">Ready to play</span>
        <Link
          href={quizHref}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Start
          <ArrowRight />
        </Link>
      </CardFooter>
    </Card>
  );
}
