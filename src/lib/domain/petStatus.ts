import { resolveLostState } from "./emergency.ts";
import type { LostAlert } from "../../types/emergency";
import type { PetEmergency, PetStatus } from "../../types/pet";

export const PET_STATUSES: readonly PetStatus[] = [
  "en_casa",
  "perdido",
  "en_adopcion",
  "adoptado",
  "rescatado",
  "fallecido",
];

export const LOST_PET_STATUSES: readonly PetStatus[] = ["perdido"];

export const TERMINAL_PET_STATUSES: readonly PetStatus[] = ["fallecido"];

export const ADOPTION_PET_STATUSES: readonly PetStatus[] = ["en_adopcion", "adoptado", "rescatado"];

export function isPetStatus(value: unknown): value is PetStatus {
  return typeof value === "string" && (PET_STATUSES as readonly string[]).includes(value);
}

export function isLostPetStatus(status: PetStatus): boolean {
  return LOST_PET_STATUSES.includes(status);
}

export function isTerminalPetStatus(status: PetStatus): boolean {
  return TERMINAL_PET_STATUSES.includes(status);
}

export function isAdoptionPetStatus(status: PetStatus): boolean {
  return ADOPTION_PET_STATUSES.includes(status);
}

export type LostOverlaySource = "runtime" | "static" | "none";

export type EffectivePetState = {
  status: PetStatus;
  isLost: boolean;
  lostOverlay: LostOverlaySource;
  zonaPerdida: string | null;
  fechaPerdida: string | null;
  mensaje: string | null;
  recompensa: number | null;
};

export type ResolveEffectivePetStateInput = {
  estado: PetStatus;
  emergencia: PetEmergency;
  alert: LostAlert | null;
};

export function resolveEffectivePetState({
  estado,
  emergencia,
  alert,
}: ResolveEffectivePetStateInput): EffectivePetState {
  if (isTerminalPetStatus(estado)) {
    return {
      status: estado,
      isLost: false,
      lostOverlay: "none",
      zonaPerdida: null,
      fechaPerdida: null,
      mensaje: null,
      recompensa: null,
    };
  }

  const resolved = resolveLostState(emergencia, alert);
  const lostOverlay: LostOverlaySource = alert !== null ? "runtime" : emergencia.perdido ? "static" : "none";

  return {
    status: resolved.isLost ? "perdido" : estado,
    isLost: resolved.isLost,
    lostOverlay,
    zonaPerdida: resolved.zonaPerdida,
    fechaPerdida: resolved.fechaPerdida,
    mensaje: resolved.mensaje,
    recompensa: resolved.recompensa,
  };
}