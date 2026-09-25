import { AlertTriangle, CalendarDays, Gift, MapPin } from "lucide-react";
import { StatusPanel } from "@/components/ui/StatusPanel";
import type { DataListItem } from "@/components/ui/DataList";

type LostPetBannerProps = {
  petName: string;
  message: string | null;
  lostDate: string | null;
  lostZone: string | null;
  reward: number | null;
};

export function LostPetBanner({
  petName,
  message,
  lostDate,
  lostZone,
  reward,
}: LostPetBannerProps) {
  const details: DataListItem[] = [];

  if (lostZone) {
    details.push({
      label: "Última vez visto",
      value: lostZone,
      icon: <MapPin size={14} />,
    });
  }
  if (lostDate) {
    details.push({
      label: "Fecha",
      value: lostDate,
      icon: <CalendarDays size={14} />,
    });
  }
  if (reward) {
    details.push({
      label: "Recompensa",
      value: formatReward(reward),
      icon: <Gift size={14} />,
    });
  }

  return (
    <StatusPanel
      headingId="lost-pet-banner-title"
      tone="danger"
      statusLabel="Alerta activa"
      statusIcon={<AlertTriangle size={14} />}
      title={`${petName} está perdido`}
      subtitle="Mascota reportada como perdida"
      body={
        message ?? `Si viste o encontraste a ${petName}, por favor contacta a su familia.`
      }
      cta={{ label: "Por favor contacta inmediatamente", href: "#contacto" }}
      details={details}
    />
  );
}

function formatReward(reward: number) {
  const amount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(reward);

  return `${amount} MXN`;
}
