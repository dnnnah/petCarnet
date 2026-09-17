"use client";

import { ThankYouBanner } from "@/components/features/lost-pet/ThankYouBanner";
import { resolveEffectivePetState } from "@/lib/domain/petStatus";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { PetEmergency, PetStatus } from "@/types/pet";

type PetFooterBannerProps = {
  petId: string;
  petName: string;
  species: string;
  emergency: PetEmergency;
  status: PetStatus;
};

export function PetFooterBanner({
  petId,
  petName,
  species,
  emergency,
  status,
}: PetFooterBannerProps) {
  const { alert } = useLostAlerts(petId);
  const effective = resolveEffectivePetState({
    estado: status,
    emergencia: emergency,
    alert,
  });

  if (effective.status === "en_casa") {
    return <ThankYouBanner petName={petName} species={species} />;
  }

  if (effective.status === "perdido") {
    return <ThankYouBanner isLost petName={petName} species={species} />;
  }

  return null;
}