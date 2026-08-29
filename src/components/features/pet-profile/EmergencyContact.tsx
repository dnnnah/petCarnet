import { Phone, Send } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import { PetSpeciesIcon } from "@/lib/petIcon";

type EmergencyContactProps = {
  isLost?: boolean;
  petName: string;
  species: string;
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
  petName,
  species,
}: EmergencyContactProps) {

  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2rem] border p-5 sm:p-7",
        isLost
          ? "border-2 border-rose-300 bg-gradient-to-r from-rose-100 via-white to-amber-100 shadow-[0_22px_54px_rgba(225,29,72,0.18)] ring-4 ring-rose-100 dark:from-rose-950/50 dark:via-gray-900 dark:to-amber-950/40 dark:ring-rose-900"
          : "border-amber-100 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/70 dark:from-amber-950/40 dark:via-gray-900 dark:to-emerald-950/40 shadow-[0_16px_38px_rgba(217,119,6,0.06)]",
      ].join(" ")}
    >
      {isLost ? <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-rose-500 via-red-400 to-amber-400" /> : null}
      <div className={["absolute -right-3 -top-6", isLost ? "text-rose-300" : "text-amber-200"].join(" ")}>
        <Phone size={isLost ? 74 : 58} />
      </div>
      <div
        className={[
          "pointer-events-none absolute -right-1 bottom-1 hidden rotate-[-8deg] rounded-[1.5rem] bg-white/80 dark:bg-gray-900/80 p-3 shadow-[0_12px_26px_rgba(17,24,39,0.08)] ring-1 md:block",
          isLost ? "text-rose-400 ring-rose-100" : "text-amber-400 ring-amber-100",
        ].join(" ")}
      >
        <PetSpeciesIcon species={species} size={54} strokeWidth={1.8} />
      </div>
      <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            {isLost ? "Contacto urgente ahora" : "Contacto de Emergencia"}
          </h2>
          <p className="mt-3 text-base font-bold text-gray-700 dark:text-gray-200">
            {isLost
              ? `Si encontraste a ${petName}, llama o envía WhatsApp ahora.`
              : `Si encontraste a ${petName}, por favor contáctanos.`}
          </p>
          <p className={["mt-2 text-sm font-bold", isLost ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"].join(" ")}>
            {contact.neighborhood}
          </p>
        </div>
        <div className={["grid min-w-0 gap-3", isLost ? "sm:grid-cols-2" : "sm:grid-cols-2"].join(" ")}>
          <ActionButton href={`tel:${contact.phoneHref}`} label="Llamar" helper={contact.phone} icon={Phone} size={isLost ? "large" : "normal"} tone={isLost ? "urgentCall" : "call"} />
          <ActionButton href={contact.whatsapp} label="WhatsApp" helper="Enviar mensaje" icon={Send} size={isLost ? "large" : "normal"} tone={isLost ? "urgentWhatsapp" : "whatsapp"} />
        </div>
      </div>
    </section>
  );
}
