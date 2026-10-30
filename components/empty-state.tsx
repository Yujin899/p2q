import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="grid size-11 place-items-center rounded-full border bg-[var(--paper-card-2)] text-[var(--paper-accent)]">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
