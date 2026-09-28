import { cx, resolveTone, type ToneName } from "@/lib/ui/tone";

type SectionProps = {
  children: React.ReactNode;
  /** Título de la sección. Se muestra como <h2> por defecto. */
  title?: React.ReactNode;
  eyebrow?: string;
  description?: string;
  icon?: React.ReactNode;
  /**
   * Tono semantico del encabezado. El color nunca pinta la seccion entera: solo
   * el overline y el icono, que es donde dice algo. Por eso el color puede
   * variar de una seccion a otra sin que la pagina se lea como un arcoiris.
   */
  tone?: ToneName;
  /** Acción a la derecha del encabezado (enlace, botón, contador). */
  action?: React.ReactNode;
  /** Nivel del encabezado, para respetar la jerarquía real del documento. */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  bodyClassName?: string;
  /** Quita el padding interior; útil cuando la sección ya es una hoja. */
  bare?: boolean;
};

/**
 * Sección de documento. El encabezado lleva un filete inferior en lugar de
 * una caja alrededor: así las secciones se leen como capítulos de un documento
 * y no como tarjetas apiladas.
 */
export function Section({
  children,
  title,
  eyebrow,
  description,
  icon,
  tone = "brand",
  action,
  as: Heading = "h2",
  id,
  className,
  bodyClassName,
  bare,
}: SectionProps) {
  const hasHeader = Boolean(title || eyebrow || action);
  const toneClass = resolveTone(tone).text;

  return (
    <section id={id} className={cx("min-w-0", className)}>
      {hasHeader ? (
        <header
          className={cx(
            "flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-rule pb-3",
            !bare && "mb-5"
          )}
        >
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className={cx("overline mb-1.5", toneClass)}>{eyebrow}</p>
            ) : null}
            <div className="flex items-center gap-2.5">
              {icon ? (
                <span aria-hidden="true" className={cx("shrink-0", toneClass)}>
                  {icon}
                </span>
              ) : null}
              {/* La escala sale del nivel del encabezado, no de cada llamada: por
                  eso el documento tiene una sola jerarquia. Antes cada seccion
                  elegia su tamano y el perfil acababa con 18, 20, 24 y 30px
                  para titulos del mismo peso. Un <h3> anidado baja un escalon
                  y se lee como subordinado, que es lo que es. */}
              <Heading
                className={cx(
                  Heading === "h2" ? "text-2xl sm:text-[1.75rem]" : "text-xl sm:text-2xl",
                  "font-semibold text-ink"
                )}
              >
                {title}
              </Heading>
            </div>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-2">{description}</p>
            ) : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </header>
      ) : null}

      <div className={cx(bare ? "" : "", bodyClassName)}>{children}</div>
    </section>
  );
}
