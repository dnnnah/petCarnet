import type { PetId } from "../../types/pet";
import type { Shelter, ShelterId } from "../../types/shelter";

export function findShelterById(shelters: ReadonlyArray<Shelter>, shelterId: ShelterId): Shelter | null {
  return shelters.find((shelter) => shelter.id === shelterId) ?? null;
}

export function findShelterForPet(petId: PetId, shelters: ReadonlyArray<Shelter>): Shelter | null {
  return shelters.find((shelter) => shelter.mascotas.includes(petId)) ?? null;
}