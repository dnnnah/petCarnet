import { cx } from "@/lib/ui/tone";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Contenido auxiliar a la derecha (por ejemplo un contador). */
  meta?: React.ReactNode;
};

type SegmentedControlProps<T extends string> = {
  /** Etiqueta del grupo, leída por lectores de pantalla. */
  label: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Grupo de botones excluyentes (tipo "segmented control").
 *
 * Existía reimplementado en cuatro sitios (filtro de mascotas, filtro de
 * vacunas, formato del carnet y filtro de especie en adopción) con paletas
 * distintas. El estado activo siempre usa tinta, así que el color no cambia
 * entre activo e inactivo y no compite con el tono de cada opción.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cx(
              "inline-flex min-h-11 items-center gap-2 rounded-md px-3.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-ink text-on-solid"
                : "border border-rule bg-surface text-ink-2 hover:border-brand-rule hover:text-brand"
            )}
          >
            {option.icon ? (
              <span aria-hidden="true" className="shrink-0">
                {option.icon}
              </span>
            ) : null}
            {option.label}
            {option.meta ? (
              <span
                aria-hidden="true"
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-white/20" : "bg-sunken text-ink-3"
                )}
              >
                {option.meta}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
