import Link from "next/link";
import { Heart, PawPrint, Sparkles } from "lucide-react";
import { SiteNav } from "./SiteNav";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dotted-path opacity-40" />
      <div className="pointer-events-none absolute left-3 top-8 rotate-12 text-amber-200/70 hidden sm:block">
        <Sparkles size={26} />
      </div>
      <div className="pointer-events-none absolute right-3 top-20 h-24 w-14 rotate-[20deg] doodle-line hidden sm:block" />
      <div className="pointer-events-none absolute left-5 top-36 rotate-12 text-emerald-200/80 hidden sm:block">
        <PawPrint size={46} fill="currentColor" />
      </div>
      <div className="pointer-events-none absolute right-7 top-36 -rotate-12 text-pink-300/80 hidden sm:block">
        <Heart size={30} />
      </div>
      <div className="pointer-events-none absolute bottom-28 left-8 text-blue-100 hidden md:block">
        <Sparkles size={54} />
      </div>

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-emerald-600 focus:px-5 focus:py-3 focus:text-sm focus:font-extrabold focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-5 sm:gap-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <span className="grid h-11 w-11 sm:h-14 sm:w-14 place-items-center rounded-[1.1rem] sm:rounded-[1.35rem] bg-white text-gray-950 shadow-[0_12px_28px_rgba(17,24,39,0.09)] ring-1 ring-gray-100 dark:bg-white/10 dark:text-white dark:ring-white/10">
            <PawPrint size={28} className="sm:hidden" />
            <PawPrint size={34} className="hidden sm:block" />
          </span>
          <span>
            <span className="block text-2xl sm:text-3xl font-extrabold leading-7 tracking-tight text-gray-950 dark:text-gray-50">
              PetCarnet
            </span>
            <span className="block text-xs sm:text-base font-bold leading-5 text-gray-900 dark:text-gray-400">
              Carnet Digital
            </span>
          </span>
        </Link>

        <SiteNav />
      </header>

      <main id="contenido" tabIndex={-1} className="relative z-10 focus:outline-none">
        {children}
      </main>
    </div>
  );
}
