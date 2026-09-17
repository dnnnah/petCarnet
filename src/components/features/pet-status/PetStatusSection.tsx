"use client";

import { LostModeAlertSections } from "@/components/features/lost-pet/LostModeAlertSections";
import { resolvePetStatusView } from "@/lib/mapping/petStatusPresentation";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { PetStateBanner } from "./PetStateBanner";

type PetStatusSectionProps = {
  petId: string;
  petName: string;
  emergency: PetEmergency;
  whatsappNumber?: string;
  status: PetStatus;
};

export function PetStatusSection({
  petId,
  petName,
  emergency,
  whatsappNumber = "",
  status,
}: PetStatusSectionProps) {
  const { alert } = useLostAlerts(petId);
  const { kind, effective } = resolvePetStatusView({
    estado: status,
    emergencia: emergency,
    alert,
  });

  if (kind === "lost-mode") {
    return (
      <LostModeAlertSections
        petId={petId}
        petName={petName}
        emergency={emergency}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  if (kind === "none") {
    return null;
  }

  return <PetStateBanner petName={petName} status={effective.status} />;
}