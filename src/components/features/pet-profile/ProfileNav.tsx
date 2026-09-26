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
      className="sticky top-0 z-40 -mx-4 border-y border-rule bg-canvas/95 px-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:border-b lg:px-0"
    >
      {/*
        El carril va alineado a la columna de contenido, no a pantalla
        completa. Con `justify-between` sobre la ventana entera los nueve
        destinos quedaban sueltos —a 1920px, con ~200px entre uno y otro— y el
        primero pegado al borde de la pantalla, sin relacion con el texto de
        abajo. Alineado a la columna, el reparto se ve deliberado y los
        extremos del nav caen en la misma linea que el contenido.

        Las nueve etiquetas ocupan ~830px con el tamaño actual del item, asi que
        hacen falta dos cosas para que quepan en la columna: la pagina pasa a
        `max-w-5xl` (960px utiles) y el item se aprieta —icono 16, `text-[13px]`,
        `px-2`— dejando ~130px de holgura en vez de los 6px que daba
        `max-w-4xl`, donde cualquier diferencia de metricas de la fuente lo
        desbordaba.

        La mascara de degradado solo vive por debajo de `lg`, que es donde el
        carril llega a desplazar. Entre 1024 y 1279 se conservaba aun sin
        desborde y desvanecía el ultimo destino sin motivo.

        En movil no se reparte: nueve iconos de 44px no entran en 288px, asi que
        ahi el carril va pegado a la izquierda y desplazable, que es lo unico
        que conserva el area tactil. En tablet tampoco, y por un motivo concreto:
        con `justify-between` los nueve iconos solos se separaban 71px entre si y,
        al desplegarse las etiquetas, bajaban a 16px. Los destinos se movian
        debajo del cursor a media lectura. Empacados, el despliegue solo anade
        ancho hacia la derecha y el primer destino —y el que se esta leyendo— no
        se mueve. El reparto de punta a punta queda en `xl`, donde las etiquetas
        estan siempre y no hay nada que reordenar.
      */}
      {/* `contain: paint` es obligatorio: sin él, el contenido desplazable del
          carril se sumaba al ancho de la página (410px en un viewport de 320px).
          El `px-1.5` interno deja sitio al `outline-offset: 2px` del foco global
          para que `contain: paint` no lo recorte en los extremos. */}
      <ul className="scrollbar-none -mx-1.5 flex items-center gap-0.5 overflow-x-auto px-1.5 py-1.5 [contain:paint] [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] lg:gap-2 lg:[mask-image:none] xl:justify-between xl:gap-1">
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
                  "flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-brand-soft text-brand-ink"
                    : "text-ink-2 hover:bg-sunken hover:text-ink"
                )}
              >
                <Icon size={16} className="shrink-0" aria-hidden="true" />
                {/* El nombre se pliega con `max-width`, no con `hidden`: asi el
                    despliegue del tablet se puede animar. El ancho de la etiqueta
                    no altera el nombre accesible, que sigue viniendo de
                    `aria-label`. */}
                <span
                  className={cx(
                    "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none",
                    scrolled && "lg:max-w-[10rem] lg:opacity-100",
                    "xl:max-w-[10rem] xl:opacity-100"
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
