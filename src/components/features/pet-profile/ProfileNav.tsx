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
  // Se inicializa con la primera sección: como solo la activa despliega su
  // rótulo, arrancar en `""` dejaba el carril como nueve iconos sin contexto
  // hasta que el observador de intersección registrara la primera sección.
  const [active, setActive] = useState(defaultNavItems[0].id);
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
      className="sticky top-0 z-40 -mx-4 border-y border-rule bg-canvas/95 px-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/*
        Las nueve etiquetas suman ≈1009px y el carril del perfil mide 840px
        incluso a 1280px de viewport, así que mostrar rótulos por breakpoint
        siempre desbordaba en algún ancho. En su lugar solo la sección activa
        despliega su nombre: el carril cabe en cualquier pantalla, cada destino
        conserva su nombre accesible y el `title` lo expone al puntero. El
        degradado del borde derecho indica que el carril continúa.
      */}
      {/* `contain: paint` es obligatorio: sin él, el contenido desplazable del
          carril se sumaba al ancho de la página (410px en un viewport de 320px).
          El `px-1.5` interno deja sitio al `outline-offset: 2px` del foco global
          para que `contain: paint` no lo recorte en los extremos. */}
      <ul className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto px-1.5 py-1.5 [contain:paint] [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] sm:[mask-image:none]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={item.label}
                title={item.label}
                className={cx(
                  "flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-brand-soft text-brand-ink"
                    : "text-ink-2 hover:bg-sunken hover:text-ink"
                )}
              >
                <Icon size={17} className="shrink-0" aria-hidden="true" />
                <span className={isActive ? "whitespace-nowrap" : "sr-only"}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
