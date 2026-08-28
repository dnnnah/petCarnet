import { notFound } from "next/navigation";
import { getPetById } from "@/lib/getPetById";
import type { PetProfile } from "@/types/pet";

export function getPetOrNotFound(id: string): PetProfile {
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

  return pet;
}
