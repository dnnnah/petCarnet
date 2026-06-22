import { Cat, Dog, MapPin, Phone, Send } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";

type EmergencyContactProps = {
  species: string;
  contact: {
    name: string;
    phone: string;
    whatsapp: string;
    locationUrl: string;
    neighborhood: string;
  };
};

export function EmergencyContact({ contact, species }: EmergencyContactProps) {
  const PetIcon = species.toLowerCase().includes("gato") ? Cat : Dog;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/70 p-5 shadow-[0_16px_38px_rgba(217,119,6,0.06)] sm:p-7">
      <div className="absolute -right-3 -top-6 text-amber-200">
        <Phone size={58} />
      </div>
      <div className="pointer-events-none absolute -right-1 bottom-1 hidden rotate-[-8deg] rounded-[1.5rem] bg-white/80 p-3 text-amber-400 shadow-[0_12px_26px_rgba(17,24,39,0.08)] ring-1 ring-amber-100 md:block">
        <PetIcon size={54} strokeWidth={1.8} />
      </div>
      <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
            Contacto de Emergencia
          </h2>
          <p className="mt-3 text-base font-bold text-gray-700">
            Si encontraste a Lucca, por favor contáctanos.
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-700">{contact.neighborhood}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ActionButton href={`tel:${contact.phone}`} label="Llamar" helper="55 1234 5678" icon={Phone} tone="call" />
          <ActionButton href={contact.whatsapp} label="WhatsApp" helper="Enviar mensaje" icon={Send} tone="whatsapp" />
          <ActionButton href={contact.locationUrl} label="Ubicación" helper="Zona habitual" icon={MapPin} tone="location" />
        </div>
      </div>
    </section>
  );
}
