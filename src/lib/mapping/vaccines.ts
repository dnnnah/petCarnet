import type { PetProfile } from "@/types/pet";

export type VaccineSummary = {
  total: number;
  alDia: number;
  proximas: number;
  vencidas: number;
};

export function getVaccineSummary(pet: PetProfile): VaccineSummary {
  const vaccines = pet.vacunas;
  return {
    total: vaccines.length,
    alDia: vaccines.filter((v) => v.estatus === "al_dia").length,
    proximas: vaccines.filter((v) => v.estatus === "proxima_dosis").length,
    vencidas: vaccines.filter((v) => v.estatus === "vencida").length,
  };
}
