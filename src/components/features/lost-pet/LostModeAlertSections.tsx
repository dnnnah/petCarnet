"use client";

import { BellRing } from "lucide-react";
import { formatMexicanDate } from "@/lib/dateFormat";
import { resolveLostState } from "@/lib/domain/emergency";
import { useLostAlerts } from "@/lib/useLostAlerts";
import { LostPetBanner } from "./LostPetBanner";
import { LostPetInstructions } from "./LostPetInstructions";
import type { PetEmergency } from "@/types/pet";

type LostModeAlertSectionsProps = {
  petId: string;
  petName: string;
  emergency: PetEmergency;
};

export function LostModeAlertSections({ petId, petName, emergency }: LostModeAlertSectionsProps) {
  const { alert, deactivate } = useLostAlerts(petId);
  const resolved = resolveLostState(emergency, alert);

  if (!resolved.isLost) return null;

  const lostDate = resolved.fechaPerdida
    ? formatMexicanDate(resolved.fechaPerdida) ?? resolved.fechaPerdida
    : null;

  return (
    <div className="space-y-6">
      {alert !== null ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-3.5 ring-1 ring-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:ring-rose-900/60">
          <p className="inline-flex items-center gap-2 text-sm font-extrabold text-rose-700 dark:text-rose-300">
            <BellRing size={18} aria-hidden="true" />
            Modo alerta activo en el perfil
          </p>
          <button
            type="button"
            onClick={deactivate}
            className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700"
          >
            Desactivar modo alerta
          </button>
        </div>
      ) : null}

      <LostPetBanner
        petName={petName}
        message={resolved.mensaje}
        lostDate={lostDate}
        lostZone={resolved.zonaPerdida}
        reward={resolved.recompensa}
      />

      <LostPetInstructions petName={petName} instructions={emergency.instrucciones} />
    </div>
  );
}