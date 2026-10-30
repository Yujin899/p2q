import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowRight,
  LibraryBig,
  Plus,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuizCard } from "@/components/quiz/quiz-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDashboardStats,
  getQuizzes,
  getRecentAttempts,
} from "@/lib/data/quizzes";
import {
  QUIZ_MODE_LABELS,
  formatDate,
  formatPercentage,
} from "@/lib/format";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Create quizzes with AI, import them, and track your attempts."
        actions={
          <>
            <Link
              href="/dashboard/create"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Create quiz
            </Link>
            <Link
              href="/dashboard/library"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              <LibraryBig />
              Library
            </Link>
          </>
        }
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  await connection();

  const [stats, quizzes, attempts] = await Promise.all([
    getDashboardStats(),
    getQuizzes(),
    getRecentAttempts(5),
  ]);

  const recentQuizzes = quizzes.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Quizzes"
          value={String(stats.quizCount)}
          icon={LibraryBig}
          hint="In your library"
        />
        <StatCard
          label="Attempts"
          value={String(stats.attemptCount)}
          icon={Target}
          hint="Completed attempts"
        />
        <StatCard
          label="Average score"
          value={formatPercentage(stats.averagePercentage)}
          icon={Trophy}
          hint={
            stats.attemptCount > 0
              ? "Across all attempts"
              : "No attempts yet"
          }
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent quizzes</h2>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentQuizzes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No quizzes yet"
            description="Generate a prompt, paste the AI response, and your first quiz will appear here."
            action={
              <Link
                href="/dashboard/create"
                className={buttonVariants({ size: "sm" })}
              >
                Create your first quiz
              </Link>
            }
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent activity</h2>
        </div>

        {attempts.length > 0 ? (
          <Card size="sm">
            <CardContent className="grid gap-2">
              {attempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/dashboard/quiz/${attempt.quiz.id}`}
                  className="flex items-center justify-between gap-3 rounded-sm border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {attempt.quiz.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(attempt.completedAt)} ·{" "}
                      {QUIZ_MODE_LABELS[attempt.mode]} · {attempt.score}/
                      {attempt.total} correct
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatPercentage(attempt.percentage)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card size="sm">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No attempts yet. Open a quiz to get started.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-sm border bg-[var(--paper-card-2)]"
          />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-sm border bg-[var(--paper-card-2)]"
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-sm border bg-[var(--paper-card-2)]" />
      </div>
    </div>
  );
}
