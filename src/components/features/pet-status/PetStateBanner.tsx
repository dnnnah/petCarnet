import { getPetStatusMeta } from "@/lib/mapping/petStatusPresentation";
import { StatusPanel } from "@/components/ui/StatusPanel";
import type { PetStatus } from "@/types/pet";

type PetStateBannerProps = {
  petName: string;
  status: PetStatus;
};

type StateBannerCopy = {
  heading: string;
  sub: string;
  body: string;
  cta?: { label: string; href: string };
};

const copyByStatus: Record<PetStatus, StateBannerCopy> = {
  en_casa: {
    heading: "{petName} está en casa",
    sub: "Está en casa y a salvo.",
    body: "Su familia puede estar tranquila: todo está en orden.",
  },
  perdido: {
    heading: "{petName} está perdido",
    sub: "Reportado como perdido: toda ayuda es bienvenida.",
    body: "Si viste o encontraste a {petName}, contacta a su familia de inmediato.",
    cta: { label: "Contactar a su familia", href: "#contacto" },
  },
  en_adopcion: {
    heading: "{petName} está buscando familia",
    sub: "Busca un hogar donde recibir todo el amor que merece.",
    body: "Su familia está abierta a propuestas de adopción responsable. Escríbeles para conocer el proceso y darle a {petName} el hogar que necesita.",
    cta: { label: "Conocer el proceso de adopción", href: "#contacto" },
  },
  adoptado: {
    heading: "{petName} encontró un hogar",
    sub: "Encontró un hogar y comparte su vida con una familia.",
    body: "Ahora vive junto a una familia que lo quiere. Este perfil se conserva como parte de su historia.",
  },
  rescatado: {
    heading: "{petName} está a salvo",
    sub: "Fue rescatado y ahora está a salvo.",
    body: "Gracias a quienes lo avistaron y ayudaron a que volviera a casa.",
  },
  fallecido: {
    heading: "En memoria de {petName}",
    sub: "Con cariño y para siempre.",
    body: "Este perfil se conserva como un recuerdo de los momentos que compartieron.",
  },
};

const fallbackCopy: StateBannerCopy = {
  heading: "Estado desconocido",
  sub: "No pudimos determinar el estado actual de este perfil.",
  body: "Si tienes información, puedes contactar a su familia.",
  cta: { label: "Contactar a su familia", href: "#contacto" },
};

function fill(petName: string, value: string) {
  return value.replaceAll("{petName}", petName);
}

export function PetStateBanner({ petName, status }: PetStateBannerProps) {
  const meta = getPetStatusMeta(status);
  const StatusIcon = meta.icon;
  const copy = copyByStatus[status] ?? fallbackCopy;

  return (
    <StatusPanel
      headingId="pet-state-banner-title"
      tone={meta.tone}
      statusLabel={meta.label}
      statusIcon={<StatusIcon size={14} />}
      title={fill(petName, copy.heading)}
      subtitle={copy.sub}
      body={fill(petName, copy.body)}
      cta={copy.cta}
    />
  );
}
