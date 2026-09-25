import Link from "next/link";
import { PawPrint } from "lucide-react";
import { SiteNav } from "./SiteNav";
import { ThemeToggle } from "./ThemeToggle";

type AppShellProps = {
  children: React.ReactNode;
};

const footerLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#mascotas", label: "Mascotas" },
  { href: "/adopciones", label: "Adopciones" },
  { href: "/login", label: "Iniciar sesión" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-on-solid"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-rule bg-canvas">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 items-center gap-2.5"
            aria-label="PetCarnet, inicio"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand text-on-solid">
              <PawPrint size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl font-semibold leading-none tracking-tight text-ink">
                PetCarnet
              </span>
              <span className="mt-0.5 block text-[11px] font-medium leading-none text-ink-3">
                Carnet digital
              </span>
            </span>
          </Link>

          <ThemeToggle />

          <SiteNav />
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer className="mt-16 border-t border-rule bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
            <div className="max-w-xs">
              <p className="font-display text-lg font-semibold text-ink">PetCarnet</p>
              <p className="mt-1.5 text-sm leading-6 text-ink-2">
                El carnet digital de tu mascota: identidad, salud y contacto de emergencia en un
                solo lugar.
              </p>
            </div>
            <nav aria-label="Menú del pie">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="-mx-2 inline-flex min-h-11 items-center rounded-xs px-2 text-sm font-medium text-ink-2 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="mt-8 border-t border-rule pt-6 text-xs text-ink-3">
            Los perfiles públicos muestran únicamente la información que cada tutor decide
            compartir.
          </p>
        </div>
      </footer>
    </div>
  );
}
