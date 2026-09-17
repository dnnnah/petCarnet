import type { LostAlert } from "@/types/emergency";
import type { PetEmergency } from "@/types/pet";

export const LOST_ALERT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseLostAlert(raw: unknown): LostAlert | null {
  if (!isRecord(raw) || raw.active !== true) {
    return null;
  }

  const alert: LostAlert = { active: true };

  if (typeof raw.zonaPerdida === "string" && raw.zonaPerdida.trim() !== "") {
    alert.zonaPerdida = raw.zonaPerdida.trim();
  }

  if (typeof raw.fechaPerdida === "string" && LOST_ALERT_DATE_PATTERN.test(raw.fechaPerdida)) {
    alert.fechaPerdida = raw.fechaPerdida;
  }

  if (raw.recompensa === null) {
    alert.recompensa = null;
  } else if (
    typeof raw.recompensa === "number" &&
    Number.isFinite(raw.recompensa) &&
    raw.recompensa >= 0
  ) {
    alert.recompensa = raw.recompensa;
  }

  if (typeof raw.mensaje === "string" && raw.mensaje.trim() !== "") {
    alert.mensaje = raw.mensaje.trim();
  }

  return alert;
}

export function parseLostAlertDraft(raw: unknown): LostAlert | null {
  if (!isRecord(raw)) {
    return null;
  }
  return parseLostAlert({ ...raw, active: true });
}

export function isActiveLostAlert(value: unknown): value is LostAlert {
  return parseLostAlert(value) !== null;
}

export type ResolvedLostState = {
  isLost: boolean;
  zonaPerdida: string | null;
  fechaPerdida: string | null;
  mensaje: string | null;
  recompensa: number | null;
};

export function resolveLostState(
  emergencia: PetEmergency,
  alert: LostAlert | null,
): ResolvedLostState {
  const isLost = alert !== null || emergencia.perdido;

  return {
    isLost,
    zonaPerdida: alert?.zonaPerdida ?? emergencia.zonaPerdida,
    fechaPerdida: alert?.fechaPerdida ?? emergencia.fechaPerdida,
    mensaje: alert?.mensaje ?? emergencia.mensajeEmergencia,
    recompensa: alert?.recompensa ?? emergencia.recompensa,
  };
}

export function buildNeighborhoodLabel(input: {
  isLost: boolean;
  zonaPerdida: string | null | undefined;
  zonaSegura: string;
}): string {
  return input.isLost && input.zonaPerdida
    ? `Zona donde se perdió: ${input.zonaPerdida}`
    : `Zona segura: ${input.zonaSegura}`;
}

export function resolveEmergencyContactState(
  emergencia: PetEmergency,
  alert: LostAlert | null,
  zonaSegura: string,
): { isLost: boolean; neighborhood: string } {
  const resolved = resolveLostState(emergencia, alert);

  return {
    isLost: resolved.isLost,
    neighborhood: buildNeighborhoodLabel({
      isLost: resolved.isLost,
      zonaPerdida: resolved.zonaPerdida,
      zonaSegura,
    }),
  };
}
