"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const next = readTheme() === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.dataset.theme = next;
    root.classList.toggle("dark", next === "dark");

    try {
      localStorage.setItem("p2q-theme", next);
    } catch (error) {
      void error;
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={cn("theme-switch", className)}
    >
      <span className="theme-switch-icon" aria-hidden="true">
        <Moon className="theme-switch-moon" />
        <Sun className="theme-switch-sun" />
      </span>
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-knob" />
      </span>
    </button>
  );
}
