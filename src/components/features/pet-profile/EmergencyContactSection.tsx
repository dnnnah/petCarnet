"use client";

import { buildNeighborhoodLabel } from "@/lib/domain/emergency";
import { resolveEffectivePetState } from "@/lib/domain/petStatus";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { ContactViewModel } from "@/lib/mapping/profile";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { EmergencyContact } from "./EmergencyContact";

type EmergencyContactSectionProps = {
  petId: string;
  petName: string;
  emergency: PetEmergency;
  status: PetStatus;
  zonaSegura: string;
  contact: ContactViewModel;
};

export function EmergencyContactSection({
  petId,
  petName,
  emergency,
  status,
  zonaSegura,
  contact,
}: EmergencyContactSectionProps) {
  const { alert } = useLostAlerts(petId);
  const effective = resolveEffectivePetState({
    estado: status,
    emergencia: emergency,
    alert,
  });
  const neighborhood = buildNeighborhoodLabel({
    isLost: effective.isLost,
    zonaPerdida: effective.zonaPerdida,
    zonaSegura,
  });

  return (
    <EmergencyContact
      contact={{ ...contact, neighborhood }}
      isLost={effective.isLost}
      isTerminal={effective.status === "fallecido"}
      petName={petName}
    />
  );
}