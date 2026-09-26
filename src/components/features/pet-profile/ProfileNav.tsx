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

/** Columnas de la retícula del nav. Cada destino ocupa dos, de modo que una fila
 *  caben cinco. Diez columnas permiten además descentrar la última fila, que se
 *  queda con cuatro destinos: sobran dos columnas, una a cada lado. */
const NAV_COLS = 10;
const NAV_POR_FILA = 5;

// El paso a una sola fila ocurre en `sm` (640px) y no en un valor arbitrario:
// con `min-[560px]` el destino de 44px se quedaba a 44px justo a 559px de
// ancho, el único punto donde la consulta de medios no aplicaba y las celdas
// quedaban a 63px de separación con la fila descuadrada. Nueve áreas táctiles de
// 44px son 396px, y hace falta además un hueco mínimo de 16px entre ellas:
// 396 + 8x16 = 524px, más 32px de margen lateral. `sm` deja margen de sobra.

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

  // La última fila se descentra para que sus cuatro destinos no queden pegados
  // al borde izquierdo con una columna vacía al final. Con ocho destinos (sin
  // fotos) sobran cuatro columnas, dos a cada lado, y el desfase crece solo.
  const enUltimaFila = Math.max(0, navItems.length - NAV_POR_FILA);
  const desfaseUltimaFila = Math.floor((NAV_COLS - enUltimaFila * 2) / 2) + 1;

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      aria-label="Secciones del perfil"
      className={cx(
        "z-40 border-y border-rule bg-canvas/95 backdrop-blur-sm",
        "sm:sticky sm:top-0"
      )}
    >
      {/*
        Reparto de punta a punta dentro de la columna, no de la ventana: con
        `justify-between` sobre el ancho completo los nueve destinos quedaban
        sueltos a ~200px entre si en pantallas anchas y el primero pegado al
        borde de la pantalla, sin relación con el texto de abajo.

        Por debajo de 640px los nueve destinos no caben en una fila, y con un
        carril desplazable había que deslizar para ver el último: un destino que
        no se ve es un destino que no existe. Ahí el nav es una retícula de dos
        filas, cinco destinos arriba y cuatro abajo, con separación real entre
        ellos. No puede ser `flex-wrap`: al no haber hueco, envuelve lo más
        apretado posible y deja destinos huérfanos en la segunda fila.

        El nav solo es sticky cuando ya es una sola fila. Dos filas ocupan 112px,
        y fijarlas debajo del encabezado dejaria casi una quinta parte de la
        pantalla de un telefono ocupada de forma permanente.

        Las etiquetas se despliegan al bajar, porque ahi es cuando la persona ya
        esta leyendo y le sirve saber donde esta. La columna del perfil es de 6xl
        para que, con las nueve etiquetas visibles, el hueco entre destinos sea de
        21px a 1024 y de 37px a partir de 1280, en vez de los 14px que daba la
        columna de 5xl.
      */}
      <ul
        className={cx(
          "grid grid-cols-10 gap-1.5 py-2",
          "sm:flex sm:flex-nowrap sm:justify-between sm:gap-x-3 sm:py-1.5"
        )}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <li
              key={item.id}
              /* En la retícula cada destino ocupa su celda entera: si el `li` se
                 queda con el ancho del contenido, el sobrante se acumula dentro
                 de la celda, los botones quedan arrimados a la izquierda y la
                 fila no llega al borde derecho. */
              className="col-span-2 max-sm:w-full max-sm:self-stretch"
              style={index === NAV_POR_FILA ? { gridColumnStart: desfaseUltimaFila } : undefined}
            >
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={item.label}
                title={item.label}
                className={cx(
                  "flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-1.5 text-[13px] font-medium transition-colors duration-150",
                  "max-sm:w-full",
                  isActive ? "bg-brand-soft text-brand-ink" : "text-ink-2 hover:bg-sunken hover:text-ink"
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
