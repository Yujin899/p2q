import Link from "next/link";
import { Suspense } from "react";
import { Plus, Sparkles } from "lucide-react";

import { AccountPanel } from "@/components/dashboard/account-panel";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

function NavFallback({
  orientation,
}: {
  orientation: "vertical" | "horizontal";
}) {
  return (
    <div
      className={
        orientation === "vertical"
          ? "grid gap-1 px-3"
          : "grid h-full grid-cols-3 px-2"
      }
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={
            orientation === "vertical"
              ? "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground"
              : "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
          }
        >
          <Icon className={orientation === "vertical" ? "size-4" : "size-5"} />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}

function AccountFallback({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="size-7 animate-pulse rounded-full bg-muted" />
        <span className="size-7 animate-pulse rounded-sm bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <span className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <span className="block h-3.5 w-24 animate-pulse rounded bg-muted" />
        <span className="block h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
      <span className="size-7 animate-pulse rounded-sm bg-muted" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card/95 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="paper-brand-mark grid size-8 place-items-center">
              <Sparkles className="size-4" />
            </span>
            <span>
              <span className="block font-serif text-base font-semibold leading-none">
                P2Q
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Prompt to quiz
              </span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <Suspense fallback={<NavFallback orientation="vertical" />}>
            <DashboardNav />
          </Suspense>
        </div>

        <div className="grid gap-3 border-t p-3">
          <ThemeToggle className="w-full justify-between" />
          <Suspense fallback={<AccountFallback />}>
            <AccountPanel />
          </Suspense>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="paper-brand-mark grid size-7 place-items-center">
              <Sparkles className="size-3.5" />
            </span>
            <span className="font-serif text-base font-semibold">P2Q</span>
          </Link>
          <div className="flex items-center gap-2">
            <Suspense fallback={<AccountFallback compact />}>
              <AccountPanel compact />
            </Suspense>
            <ThemeToggle />
            <Link
              href="/dashboard/create"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              New quiz
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden">
        <div className="h-14 pb-[env(safe-area-inset-bottom)]">
          <Suspense fallback={<NavFallback orientation="horizontal" />}>
            <DashboardNav orientation="horizontal" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
