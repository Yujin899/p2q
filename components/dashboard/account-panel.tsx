import { connection } from "next/server";
import { LogOut } from "lucide-react";
import { cn } from "cn";

import { signOutAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";

export async function AccountPanel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  await connection();

  const user = await requireUser();
  const label = user.name ?? user.email ?? "Account";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  const signOutButton = (
    <Button
      type="submit"
      variant="ghost"
      size="icon-sm"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut />
    </Button>
  );

  if (compact) {
    return (
      <form action={signOutAction} className={cn("flex items-center gap-1", className)}>
        <span
          className="grid size-7 place-items-center rounded-full border bg-[var(--paper-card-2)] font-serif text-xs font-semibold"
          aria-hidden="true"
        >
          {initial}
        </span>
        {signOutButton}
      </form>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 px-1 py-1", className)}>
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full border bg-[var(--paper-card-2)] font-serif text-sm font-semibold"
        aria-hidden="true"
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name ?? "Signed in"}</p>
        {user.email ? (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        ) : null}
      </div>
      <form action={signOutAction}>{signOutButton}</form>
    </div>
  );
}
