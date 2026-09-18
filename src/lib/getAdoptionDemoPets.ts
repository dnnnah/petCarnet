import adoptionPets from "@/data/adopciones.mock.json";
import { assertValidPetProfiles } from "@/lib/dataValidation";
import type { PetProfile } from "@/types/pet";

assertValidPetProfiles(adoptionPets);

const pets: PetProfile[] = adoptionPets;

export function getAdoptionDemoPets(): PetProfile[] {
  return pets;
}