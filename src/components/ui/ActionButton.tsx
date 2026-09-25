import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/ui/tone";

type ActionButtonProps = {
  href: string;
  label: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "call" | "whatsapp" | "location" | "urgentCall" | "urgentWhatsapp";
  size?: "normal" | "large";
  className?: string;
};

/**
 * Acción de contacto. Es el elemento de mayor peso en un perfil de mascota,
 * así que va sólido, con icono + texto y una jerarquía clara: la acción
 * urgente gana contraste; el resto baja a secundario.
 */
const tones = {
  call: {
    card: "bg-surface border-rule hover:border-brand-rule hover:bg-brand-soft",
    icon: "bg-brand text-white",
    label: "text-ink",
  },
  whatsapp: {
    card: "bg-surface border-rule hover:border-success-rule hover:bg-success-soft",
    icon: "bg-success text-white",
    label: "text-ink",
  },
  location: {
    card: "bg-surface border-rule hover:border-info-rule hover:bg-info-soft",
    icon: "bg-info text-white",
    label: "text-ink",
  },
  urgentCall: {
    card: "bg-danger-soft border-danger-rule hover:bg-danger hover:border-danger",
    icon: "bg-danger text-white",
    label: "text-ink",
  },
  urgentWhatsapp: {
    card: "bg-success-soft border-success-rule hover:bg-success hover:border-success",
    icon: "bg-success text-white",
    label: "text-ink",
  },
} as const;

export function ActionButton({
  href,
  label,
  helper,
  icon: Icon,
  size = "normal",
  tone = "call",
  className,
}: ActionButtonProps) {
  const classes = tones[tone];
  const urgent = tone === "urgentCall" || tone === "urgentWhatsapp";

  return (
    <a
      href={href}
      className={cx(
        "group flex w-full min-w-0 items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-colors duration-150",
        size === "large" && "sm:px-5 sm:py-4",
        classes.card,
        className
      )}
    >
      <span
        className={cx(
          "grid shrink-0 place-items-center rounded-md",
          size === "large" ? "h-11 w-11" : "h-10 w-10",
          classes.icon
        )}
      >
        <Icon size={size === "large" ? 22 : 20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cx(
            "block font-semibold leading-snug [overflow-wrap:anywhere]",
            size === "large" ? "text-lg" : "text-base",
            classes.label
          )}
        >
          {label}
        </span>
        {helper ? (
          <span className="mt-0.5 block text-sm leading-snug text-ink-2 [overflow-wrap:anywhere]">
            {helper}
          </span>
        ) : null}
      </span>
      {urgent ? (
        <span className="sr-only">Acción urgente</span>
      ) : null}
    </a>
  );
}
