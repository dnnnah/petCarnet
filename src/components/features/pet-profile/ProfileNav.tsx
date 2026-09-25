"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  ClipboardList,
  FileText,
  Heart,
  IdCard,
  PawPrint,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { cx } from "@/lib/ui/tone";

type NavItem = {
  id: string;
  label: string;
  icon: typeof Heart;
};

const defaultNavItems: NavItem[] = [
  { id: "contacto", label: "Contacto", icon: Phone },
  { id: "info", label: "Información", icon: PawPrint },
  { id: "salud", label: "Salud", icon: Heart },
  { id: "veterinario", label: "Veterinario", icon: Stethoscope },
  { id: "fotos", label: "Fotos", icon: Camera },
  { id: "vacunas", label: "Vacunas", icon: ShieldCheck },
  { id: "expediente", label: "Expediente", icon: ClipboardList },
  { id: "carnet", label: "Carnet", icon: IdCard },
  { id: "documentos", label: "Documentos", icon: FileText },
];

type ProfileNavProps = {
  hasPhotos?: boolean;
};

export function ProfileNav({ hasPhotos = true }: ProfileNavProps) {
  const [active, setActive] = useState("");
  const navItems = useMemo(
    () => defaultNavItems.filter((item) => item.id !== "fotos" || hasPhotos),
    [hasPhotos]
  );

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [navItems]);

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      aria-label="Secciones del perfil"
      className="sticky top-0 z-40 -mx-4 border-y border-rule bg-canvas/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="scrollbar-none -mx-1 flex items-center gap-0.5 overflow-x-auto py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cx(
                  "flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-brand-soft text-brand-ink"
                    : "text-ink-3 hover:bg-sunken hover:text-ink"
                )}
              >
                <Icon size={15} className="shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
