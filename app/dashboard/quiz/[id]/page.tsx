import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ListChecks } from "lucide-react";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { buttonVariants } from "@/components/ui/button";
import { getQuizForPlay, getQuizHistory } from "@/lib/data/quizzes";

export const metadata = {
  title: "Quiz",
};

export default function QuizPage({
  params,
}: PageProps<"/dashboard/quiz/[id]">) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizContent params={params} />
    </Suspense>
  );
}

async function QuizContent({
  params,
}: Pick<PageProps<"/dashboard/quiz/[id]">, "params">) {
  await connection();

  const { id } = await params;
  const [quiz, history] = await Promise.all([
    getQuizForPlay(id),
    getQuizHistory(id),
  ]);

  if (!quiz) {
    notFound();
  }

  if (quiz.questions.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="This quiz has no questions"
        description="The imported quiz does not contain any questions. Create a new quiz or try importing it again."
        action={
          <Link
            href="/dashboard/create"
            className={buttonVariants({ size: "sm" })}
          >
            Create a quiz
          </Link>
        }
      />
    );
  }

  return <QuizRunner quiz={quiz} history={history} />;
}

function QuizSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-48 animate-pulse rounded-sm border bg-[var(--paper-card-2)]"
        />
      ))}
    </div>
  );
}
