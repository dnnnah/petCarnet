import Link from "next/link";
import { Heart, PawPrint, ShieldCheck, Sparkles } from "lucide-react";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dotted-path opacity-40" />
      <div className="pointer-events-none absolute left-3 top-8 rotate-12 text-amber-200/70">
        <Sparkles size={26} />
      </div>
      <div className="pointer-events-none absolute right-3 top-20 h-24 w-14 rotate-[20deg] doodle-line" />
      <div className="pointer-events-none absolute left-5 top-36 rotate-12 text-emerald-200/80">
        <PawPrint size={46} fill="currentColor" />
      </div>
      <div className="pointer-events-none absolute right-7 top-36 -rotate-12 text-pink-300/80">
        <Heart size={30} />
      </div>
      <div className="pointer-events-none absolute bottom-28 left-8 text-blue-100">
        <Sparkles size={54} />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-[1.35rem] bg-white text-gray-950 shadow-[0_12px_28px_rgba(17,24,39,0.09)] ring-1 ring-gray-100">
            <PawPrint size={34} />
          </span>
          <span>
            <span className="block text-3xl font-extrabold leading-7 tracking-tight text-gray-950">
              PetCarnet
            </span>
            <span className="block text-base font-bold leading-5 text-gray-900">
              Pasaporte Digital
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50/82 px-6 py-3 text-base font-extrabold text-gray-900 shadow-[0_12px_30px_rgba(16,185,129,0.1)] backdrop-blur sm:flex">
          <ShieldCheck className="text-emerald-600" size={21} />
          Perfil Verificado
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}
