import { cx } from "@/lib/ui/tone";

export type DataListItem = {
  label: string;
  value: React.ReactNode;
  /** Ancho del valor: "auto" encola, "full" ocupa la fila. */
  width?: "auto" | "full";
  icon?: React.ReactNode;
};

type DataListProps = {
  items: DataListItem[];
  /** "rows" = pares label/valor apilados. "grid" = 2-3 columnas en escritorio. */
  layout?: "rows" | "grid";
  columns?: 2 | 3;
  className?: string;
};

/**
 * Lista de datos del expediente. Sustituye a las rejillas de "tarjetas de
 * información": un solo filete por fila, label en versalitas y valor en cuerpo.
 * Legible en pantalla, legible impreso, sin caja alrededor de cada dato.
 */
export function DataList({ items, layout = "rows", columns = 2, className }: DataListProps) {
  const usable = items.filter((item) => item.value !== null && item.value !== undefined);

  if (usable.length === 0) return null;

  if (layout === "grid") {
    return (
      <dl
        className={cx(
          "grid gap-x-8 sm:grid-cols-2",
          columns === 3 ? "lg:grid-cols-3" : "",
          className
        )}
      >
        {usable.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-rule py-2.5"
          >
            <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
              {item.label}
            </dt>
            <dd className="min-w-0 text-sm font-medium text-ink [overflow-wrap:anywhere]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cx("divide-y divide-rule", className)}>
      {usable.map((item) => (
        <div
          key={item.label}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5 sm:flex-nowrap"
        >
          <dt className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-3 sm:w-44">
            {item.icon ? (
              <span aria-hidden="true" className="text-ink-3">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </dt>
          <dd className="min-w-0 flex-1 text-sm font-medium text-ink [overflow-wrap:anywhere]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
