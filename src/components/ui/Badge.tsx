import { cx, resolveTone } from "@/lib/ui/tone";

type BadgeProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: string;
  className?: string;
};

/**
 * Etiqueta de estado. A diferencia de `Pill` no se trunca: si el texto es
 * largo, se ajusta. Se reserva a información que identifica ("Perdido",
 * "En casa", "Vacunas al día") — nunca a decoración.
 */
export function Badge({ children, icon, tone = "muted", className }: BadgeProps) {
  const classes = resolveTone(tone);

  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        classes.soft,
        className
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">{children}</span>
    </span>
  );
}
