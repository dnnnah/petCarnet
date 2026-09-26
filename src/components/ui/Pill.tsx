import { cx, resolveTone } from "@/lib/ui/tone";

type PillProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** Nombre semántico de tono; también acepta alias legacy (mint, rose, …). */
  tone?: string;
  size?: "sm" | "md";
  className?: string;
  title?: string;
  /** Permite anunciar cambios de estado (p. ej. `role="status"`). */
  role?: "status" | "img";
};

/**
 * Etiqueta compacta. Pill = forma redondeada; sólo se usa cuando el contenido
 * es corto (un estado, un conteo, una categoría). Para bloques de texto va
 * `Badge`, y para listas de datos va `DataList`.
 */
export function Pill({
  children,
  icon,
  tone = "muted",
  size = "md",
  className,
  title,
  role,
}: PillProps) {
  const classes = resolveTone(tone);

  return (
    <span
      title={title}
      role={role}
      className={cx(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        classes.soft,
        className
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
