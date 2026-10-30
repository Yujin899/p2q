import { LayoutDashboard, LibraryBig, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create quiz", icon: Plus },
  { href: "/dashboard/library", label: "Library", icon: LibraryBig },
];
