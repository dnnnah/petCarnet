import { getAllPets } from "@/lib/getAllPets";

export function getPetById(id: string) {
  return getAllPets().find((pet) => pet.id === id);
}
