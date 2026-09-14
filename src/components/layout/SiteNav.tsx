"use client";

import Link from "next/link";
import { Bone, LogIn, Moon, PawPrint, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";

export function SiteNav() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className="flex items-center divide-x divide-gray-200 rounded-full bg-white px-1.5 py-1.5 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:divide-gray-700/70 dark:bg-white/5 dark:ring-white/10"
      aria-label="Menú principal"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/10 sm:px-3"
      >
        <PawPrint size={16} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>

      <Link
        href="/#mascotas"
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/10 sm:px-3"
      >
        <Bone size={16} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Mascotas</span>
      </Link>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-extrabold text-gray-700 transition hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/10 sm:px-3"
      >
        <LogIn size={16} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Iniciar sesión</span>
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-white/70 dark:text-amber-300 dark:hover:bg-white/10"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  );
}
