"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

import { NAV_ITEMS } from "@/components/dashboard/nav-items";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        orientation === "vertical"
          ? "grid gap-1 px-3"
          : "grid h-full grid-cols-3 px-2",
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-sm font-medium text-muted-foreground transition-colors",
              orientation === "vertical"
                ? "flex h-9 items-center gap-2.5 px-2.5 text-sm hover:bg-muted hover:text-foreground"
                : "flex flex-col items-center justify-center gap-1 py-2 text-[11px] hover:text-foreground",
              active && "text-foreground",
              active && orientation === "vertical" && "paper-nav-active",
              active && orientation === "horizontal" && "text-[var(--paper-accent)]",
            )}
          >
            <Icon
              className={cn(
                orientation === "vertical" ? "size-4" : "size-5",
                active && orientation === "horizontal" && "fill-primary/10",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
