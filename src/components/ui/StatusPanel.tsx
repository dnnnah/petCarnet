import { resolveTone, cx, type ToneName } from "@/lib/ui/tone";
import { Button } from "@/components/ui/Button";
import { DataList, type DataListItem } from "@/components/ui/DataList";

type StatusPanelProps = {
  tone: ToneName | string;
  /** Etiqueta corta del estado. Se anuncia como `status` para lectores de pantalla. */
  statusLabel: string;
  statusIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: { label: string; href: string };
  /** Datos de contexto (última zona, fecha, recompensa…). */
  details?: DataListItem[];
  children?: React.ReactNode;
  id?: string;
  headingId?: string;
  className?: string;
};

/**
 * Panel de estado. Es el patrón de mayor peso visual del producto y el único
 * lugar donde el color tiene permiso: el tono comunica la situación (perdido,
 * en adopción, en memoria…) y siempre viaja con icono + texto.
 *
 * No hay gradiente, ni halo, ni mancha decorativa: un filete de color a la
 * izquierda, fondo tenue y una tipografía que manda.
 */
export function StatusPanel({
  tone,
  statusLabel,
  statusIcon,
  title,
  subtitle,
  body,
  cta,
  details,
  children,
  id,
  headingId,
  className,
}: StatusPanelProps) {
  const classes = resolveTone(tone);
  const hasDetails = Boolean(details && details.length > 0);

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx("rounded-lg border border-l-2 p-5 sm:p-6", classes.rule, classes.panel, className)}
    >
      <span role="status" className="inline-block">
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
            classes.soft
          )}
        >
          {statusIcon ? (
            <span aria-hidden="true" className="shrink-0">
              {statusIcon}
            </span>
          ) : null}
          {statusLabel}
        </span>
      </span>

      <h2
        id={headingId}
        className="mt-4 text-2xl leading-tight text-ink sm:text-3xl lg:text-4xl"
      >
        {title}
      </h2>

      {subtitle ? <p className="mt-1.5 text-base font-medium text-ink">{subtitle}</p> : null}
      {body ? <p className="mt-3 max-w-2xl text-base leading-7 text-ink-2">{body}</p> : null}

      {cta ? (
        <Button href={cta.href} size="lg" className="mt-5">
          {cta.label}
        </Button>
      ) : null}

      {hasDetails ? (
        <DataList
          items={details ?? []}
          className="mt-6 border-t border-current/10 pt-1"
        />
      ) : null}

      {children}
    </section>
  );
}
