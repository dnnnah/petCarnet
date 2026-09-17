"use client";

import { resolveEmergencyContactState } from "@/lib/domain/emergency";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { ContactViewModel } from "@/lib/mapping/profile";
import type { PetEmergency } from "@/types/pet";
import { EmergencyContact } from "./EmergencyContact";

type EmergencyContactSectionProps = {
  petId: string;
  petName: string;
  species: string;
  emergency: PetEmergency;
  zonaSegura: string;
  contact: ContactViewModel;
};

export function EmergencyContactSection({
  petId,
  petName,
  species,
  emergency,
  zonaSegura,
  contact,
}: EmergencyContactSectionProps) {
  const { alert } = useLostAlerts(petId);
  const { isLost, neighborhood } = resolveEmergencyContactState(emergency, alert, zonaSegura);

  return (
    <EmergencyContact
      contact={{ ...contact, neighborhood }}
      isLost={isLost}
      petName={petName}
      species={species}
    />
  );
}
