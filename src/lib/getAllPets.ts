import mascotas from "@/data/mascotas.json";
import { assertValidPetProfiles } from "@/lib/dataValidation";
import type { PetProfile } from "@/types/pet";

assertValidPetProfiles(mascotas);

const pets: PetProfile[] = mascotas;

export function getAllPets(): PetProfile[] {
  return pets;
}