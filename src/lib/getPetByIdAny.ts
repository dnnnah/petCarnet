import { getPetById } from "@/lib/getPetById";
import { getAdoptionDemoPets } from "@/lib/getAdoptionDemoPets";
import type { PetProfile } from "@/types/pet";

export function getPetByIdAny(id: string): PetProfile | null {
  const normalizedId = id.trim();

  const realPet = getPetById(normalizedId);
  if (realPet) {
    return realPet;
  }

  return (
    getAdoptionDemoPets().find(
      (pet) => pet.id === normalizedId || pet.identificacion.codigoPublico === normalizedId,
    ) ?? null
  );
}