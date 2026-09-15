import { getAllPets } from "@/lib/getAllPets";

export function getPetById(id: string) {
  const normalizedId = id.trim();
  return getAllPets().find(
    (pet) => pet.id === normalizedId || pet.identificacion.codigoPublico === normalizedId,
  );
}
