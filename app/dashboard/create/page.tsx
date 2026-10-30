import { Suspense } from "react";
import { connection } from "next/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { CreateQuizForm } from "@/components/quiz/create-quiz-form";
import { requireUser } from "@/lib/dal";

export const metadata = {
  title: "Create quiz",
};

export default function CreateQuizPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create quiz"
        description="Configure your quiz, attach your source file in an AI tool, copy the prompt, then paste the JSON response back here."
      />
      <Suspense fallback={<CreateQuizSkeleton />}>
        <CreateQuizContent />
      </Suspense>
    </div>
  );
}

async function CreateQuizContent() {
  await connection();
  await requireUser();

  return <CreateQuizForm />;
}

function CreateQuizSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-sm border bg-[var(--paper-card-2)]"
        />
      ))}
    </div>
  );
}
