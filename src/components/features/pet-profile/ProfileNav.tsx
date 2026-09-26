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
  // Arranca marcada la primera sección en vez de `""`: sin sección activa el
  // nav queda sin ningun estado visible hasta que el observador de interseccion
  // registra la primera, que ocurre tras el primer scroll.
  const [active, setActive] = useState(defaultNavItems[0].id);
  // En tablet el carril arranca plegado en iconos y se despliega al bajar, que
  // es cuando la persona ya esta leyendo y le sirve saber donde esta. En
  // escritorio y en movil el estado no cambia nada: lo decide el CSS.
  const [scrolled, setScrolled] = useState(false);
  const navItems = useMemo(
    () => defaultNavItems.filter((item) => item.id !== "fotos" || hasPhotos),
    [hasPhotos]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className="sticky top-0 z-40 -mx-4 border-y border-rule bg-canvas/95 px-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:ml-[calc(50%_-_50vw)] lg:w-screen lg:px-6"
    >
      {/*
        Las nueve etiquetas suman ~1009px y la columna del perfil mide 832px
        (`max-w-4xl` menos el padding), asi que dentro del contenido el nav
        desbordaba en cualquier ventana. Desde `lg` el carril sale a sangre con
        `ml-[calc(50%_-_50vw)]` y `w-screen`: 1280 - 64 = 1216px, con las nueve
        etiquetas completas y holgura. El desplazamiento se hace con margen y
        no con `relative` + `translate`, porque `relative` es la misma propiedad
        que `sticky` y lo anulaba en escritorio.

        El padding lateral se queda en `lg:px-6` a proposito: alinear el
        primer y el ultimo destino con la columna de contenido exigiria
        `calc((100vw - 56rem)/2 + 2rem)` de padding, que a 1280px son 224px por
        lado y dejan 832px utiles, exactamente los 832px que las etiquetas no
        caben. Con el padding corto el carril usa la ventana entera y
        `justify-between` reparte de punta a punta.

        Reparto de punta a punta: en escritorio las nueve etiquetas se reparten con
        `justify-between` de punta a punta. En movil no se usa: nueve iconos
        de 44px necesitan 440px y solo hay 288px, asi que ahi el carril va
        pegado a la izquierda y desplazable, que es lo unico que conserva el
        area tactil.
      */}
      {/* `contain: paint` es obligatorio: sin él, el contenido desplazable del
          carril se sumaba al ancho de la página (410px en un viewport de 320px).
          El `px-1.5` interno deja sitio al `outline-offset: 2px` del foco global
          para que `contain: paint` no lo recorte en los extremos. */}
      <ul className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto px-1.5 py-1.5 [contain:paint] [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] lg:justify-between xl:[mask-image:none]">
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
                {/* El nombre se pliega con `max-width`, no con `hidden`: asi el
                    despliegue del tablet se puede animar. El ancho de la etiqueta
                    no altera el nombre accesible, que sigue viniendo de
                    `aria-label`. */}
                <span
                  className={cx(
                    "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none",
                    scrolled && "lg:max-w-[12rem] lg:opacity-100",
                    "xl:max-w-[12rem] xl:opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
