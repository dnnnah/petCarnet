import { Phone, Send } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import { cx } from "@/lib/ui/tone";

type EmergencyContactProps = {
  isLost?: boolean;
  isTerminal?: boolean;
  petName: string;
  contact: {
    name: string;
    phone: string;
    phoneHref: string;
    whatsapp: string;
    neighborhood: string;
  };
};

export function EmergencyContact({
  contact,
  isLost = false,
  isTerminal = false,
  petName,
}: EmergencyContactProps) {
  const heading = isLost
    ? "Contacto urgente ahora"
    : isTerminal
      ? "Contacto de su familia"
      : "Contacto de emergencia";

  const subtitle = isLost
    ? `Si encontraste a ${petName}, llama o envía WhatsApp ahora.`
    : isTerminal
      ? `Si tienes información de ${petName}, puedes contactar a su familia.`
      : `Si encontraste a ${petName}, por favor contacta a su familia.`;

  return (
    <section
      className={cx(
        "rounded-lg border border-l-2 p-5 sm:p-6",
        isLost
          ? "border-danger-rule bg-danger-soft"
          : "border-rule-strong bg-surface"
      )}
    >
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.6fr]">
        <div className="min-w-0">
          <h2 className="text-2xl leading-tight text-ink sm:text-3xl">{heading}</h2>
          <p className="mt-2 text-base leading-7 text-ink-2">{subtitle}</p>
          {contact.neighborhood ? (
            <p className={cx("mt-2 text-sm font-semibold", isLost ? "text-danger" : "text-brand")}>
              {contact.neighborhood}
            </p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-2.5 sm:grid-cols-2">
          <ActionButton
            href={`tel:${contact.phoneHref}`}
            label="Llamar"
            helper={contact.phone}
            icon={Phone}
            size={isLost ? "large" : "normal"}
            tone={isLost ? "urgentCall" : "call"}
          />
          <ActionButton
            href={contact.whatsapp}
            label="WhatsApp"
            helper="Enviar mensaje"
            icon={Send}
            size={isLost ? "large" : "normal"}
            tone={isLost ? "urgentWhatsapp" : "whatsapp"}
          />
        </div>
      </div>
    </section>
  );
}
