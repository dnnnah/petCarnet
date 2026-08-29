"use client";

import Link from "next/link";
import { LogIn, Moon, PawPrint, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";

export function SiteNav() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Menú principal">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/5 sm:px-3"
      >
        <PawPrint size={16} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden md:inline">Inicio</span>
      </Link>

      <Link
        href="/#mascotas"
        className="inline-flex items-center rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/5 sm:px-3"
      >
        <span className="hidden md:inline">Mascotas</span>
      </Link>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/5 sm:px-3"
      >
        <LogIn size={16} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden md:inline">Iniciar sesión</span>
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-[0_8px_18px_rgba(17,24,39,0.08)] ring-1 ring-gray-100 transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-amber-300 dark:ring-white/10"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </nav>
  );
}
