import { cx } from "@/lib/ui/tone";

/** Props que el campo inyecta al control para no perder la conexión ARIA. */
export type FieldControlProps = {
  id: string;
  className: string;
  "aria-invalid"?: true;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  /** Debe coincidir con el `id` del control. */
  id: string;
  label: React.ReactNode;
  /** Añade "(opcional)" al final de la etiqueta. */
  optional?: boolean;
  error?: string;
  help?: string;
  /** Permite decidir la colocación del campo dentro de una rejilla. */
  className?: string;
  children: (control: FieldControlProps) => React.ReactNode;
};

const BASE_CONTROL =
  "w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3";

/**
 * Campo de formulario: etiqueta, control y mensaje de error o ayuda.
 *
 * Se responsibly del `aria-describedby` para que apunte al mensaje que realmente
 * se muestra, y de las clases del control según tenga error. Antes cada formulario
 * definía su propia copia de estas clases con paletas distintas.
 */
export function Field({ id, label, optional, error, help, className, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : help ? `${id}-help` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-ink-2">
        {label}
        {optional ? <span className="text-ink-3"> (opcional)</span> : null}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
          className: cx(
            BASE_CONTROL,
            "focus:ring-2",
            error
              ? "border-danger-rule focus:border-danger focus:ring-danger-soft"
              : "border-rule focus:border-brand-rule focus:ring-brand-soft",
          ),
        })}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-ink-3">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** Botón de envío/acción principal dentro de un formulario. */
export function SubmitButton({
  busy,
  busyLabel,
  children,
  icon,
  className,
}: {
  busy?: boolean;
  busyLabel: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy || undefined}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {busy ? (
        <>
          <Spinner />
          {busyLabel}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
