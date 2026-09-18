import { countVaccinesByStatus } from "@/lib/domain/vaccine";
import type { PetProfile } from "@/types/pet";

export type VaccineSummary = {
  total: number;
  alDia: number;
  proximas: number;
  vencidas: number;
};

export function getVaccineSummary(pet: PetProfile): VaccineSummary {
  const counts = countVaccinesByStatus(pet.vacunas);
  return {
    total: counts.total,
    alDia: counts.al_dia,
    proximas: counts.proxima_dosis,
    vencidas: counts.vencida,
  };
}
