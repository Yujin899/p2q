import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function QuizNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Quiz not found"
      description="This quiz may have been deleted, or the link is incorrect."
      action={
        <Link
          href="/dashboard/library"
          className={buttonVariants({ size: "sm" })}
        >
          Back to library
        </Link>
      }
    />
  );
}
