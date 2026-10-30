"use client";

import { useDeferredValue, useState } from "react";
import { Search, SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { QuizCard } from "@/components/quiz/quiz-card";
import type { QuizSummary } from "@/lib/quiz/play";

export function LibraryGrid({ quizzes }: { quizzes: QuizSummary[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filtered = normalizedQuery
    ? quizzes.filter((quiz) => {
        return (
          quiz.title.toLowerCase().includes(normalizedQuery) ||
          (quiz.description ?? "").toLowerCase().includes(normalizedQuery)
        );
      })
    : quizzes;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search quizzes"
          aria-label="Search quizzes"
          className="pl-8"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No quizzes match"
          description={`Nothing matched "${deferredQuery.trim()}". Try a different search.`}
        />
      )}
    </div>
  );
}
