"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={[
        "grid h-11 w-11 shrink-0 place-items-center rounded-md text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink",
        className,
      ].join(" ")}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
