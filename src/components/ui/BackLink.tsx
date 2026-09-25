import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Enlace de retorno al contexto anterior (normalmente el perfil de la mascota).
 *
 * Existía duplicado en seis páginas con la misma clase `rounded-full` + sombra
 * pesada + `focus-visible:ring-brand`; se extrajo aquí para que el patrón
 * tenga un solo lugar y herede los tokens actuales.
 */
export function BackLink({ href, children = "Volver al perfil", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-11 items-center gap-2 rounded-md border border-rule bg-surface px-3.5",
        "text-sm font-semibold text-ink-2 transition-colors hover:border-brand-rule hover:text-brand",
        className ?? "",
      ].join(" ")}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
