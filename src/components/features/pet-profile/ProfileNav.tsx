"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  FileText,
  Heart,
  PawPrint,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: typeof Heart;
};

const navItems: NavItem[] = [
  { id: "contacto", label: "Contacto", icon: Phone },
  { id: "info", label: "Información", icon: PawPrint },
  { id: "salud", label: "Salud", icon: Heart },
  { id: "veterinario", label: "Veterinario", icon: Stethoscope },
  { id: "fotos", label: "Fotos", icon: Camera },
  { id: "vacunas", label: "Vacunas", icon: ShieldCheck },
  { id: "documentos", label: "Documentos", icon: FileText },
];

export function ProfileNav() {
  const [active, setActive] = useState("");

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
  }, []);

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="sticky top-0 z-40 -mx-4 mb-6 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex gap-1 overflow-x-auto scrollbar-hide rounded-full border border-gray-100 bg-white/80 p-1.5 shadow-[0_14px_34px_rgba(17,24,39,0.07)] backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-extrabold transition",
                isActive
                  ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              <Icon size={16} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
