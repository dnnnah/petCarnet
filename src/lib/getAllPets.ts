import mascotas from "@/data/mascotas.json";
import type { PetProfile } from "@/types/pet";

const pets = mascotas as PetProfile[];

export function getAllPets() {
  return pets;
}
