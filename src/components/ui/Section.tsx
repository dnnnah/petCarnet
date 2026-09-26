import { cx } from "@/lib/ui/tone";

type SectionProps = {
  children: React.ReactNode;
  /** Título de la sección. Se muestra como <h2> por defecto. */
  title?: React.ReactNode;
  eyebrow?: string;
  description?: string;
  icon?: React.ReactNode;
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
  action,
  as: Heading = "h2",
  id,
  className,
  bodyClassName,
  bare,
}: SectionProps) {
  const hasHeader = Boolean(title || eyebrow || action);

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
              <p className="overline mb-1.5 text-ink-3">{eyebrow}</p>
            ) : null}
            <div className="flex items-center gap-2.5">
              {icon ? (
                <span aria-hidden="true" className="shrink-0 text-brand">
                  {icon}
                </span>
              ) : null}
              <Heading className="text-xl font-semibold text-ink sm:text-2xl">
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
