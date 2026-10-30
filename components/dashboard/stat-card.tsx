import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

import { Card, CardHeader } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span>{label}</span>
          <span className="grid size-7 place-items-center border bg-[var(--paper-card-2)]">
            <Icon className="size-3.5" />
          </span>
        </div>
        <div className="font-serif text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {hint ? (
          <p className={cn("text-xs text-muted-foreground")}>{hint}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}
