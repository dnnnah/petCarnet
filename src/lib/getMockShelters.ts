import shelters from "@/data/shelters.mock.json";
import { assertValidShelters } from "@/lib/shelterValidation";
import type { Shelter } from "@/types/shelter";

assertValidShelters(shelters);

const shelterList: Shelter[] = shelters;

export function getMockShelters(): Shelter[] {
  return shelterList;
}

export { assertValidShelters, collectShelterValidationErrors } from "@/lib/shelterValidation";