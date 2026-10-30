import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Plus, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryGrid } from "@/components/quiz/library-grid";
import { buttonVariants } from "@/components/ui/button";
import { getQuizzes } from "@/lib/data/quizzes";

export const metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Every quiz you have created and imported."
        actions={
          <Link
            href="/dashboard/create"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus />
            Create quiz
          </Link>
        }
      />

      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent />
      </Suspense>
    </div>
  );
}

async function LibraryContent() {
  await connection();

  const quizzes = await getQuizzes();

  if (quizzes.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Your library is empty"
        description="Create your first quiz by generating a prompt and pasting the AI response."
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

  return <LibraryGrid quizzes={quizzes} />;
}

function LibrarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-full max-w-sm animate-pulse rounded-sm border bg-[var(--paper-card-2)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-sm border bg-[var(--paper-card-2)]"
          />
        ))}
      </div>
    </div>
  );
}
