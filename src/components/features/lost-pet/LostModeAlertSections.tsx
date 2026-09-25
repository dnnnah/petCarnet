"use client";

import { BellRing } from "lucide-react";
import { formatMexicanDate } from "@/lib/dateFormat";
import { resolveLostState } from "@/lib/domain/emergency";
import { useLostAlerts } from "@/lib/useLostAlerts";
import { FoundPetPanel } from "./FoundPetPanel";
import { LostPetBanner } from "./LostPetBanner";
import { LostPetInstructions } from "./LostPetInstructions";
import type { PetEmergency } from "@/types/pet";

type LostModeAlertSectionsProps = {
  petId: string;
  petName: string;
  emergency: PetEmergency;
  whatsappNumber?: string;
};

export function LostModeAlertSections({
  petId,
  petName,
  emergency,
  whatsappNumber = "",
}: LostModeAlertSectionsProps) {
  const { alert, deactivate } = useLostAlerts(petId);
  const resolved = resolveLostState(emergency, alert);

  if (!resolved.isLost) return null;

  const lostDate = resolved.fechaPerdida
    ? formatMexicanDate(resolved.fechaPerdida) ?? resolved.fechaPerdida
    : null;

  return (
    <div className="space-y-6">
      {alert !== null ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger-rule bg-surface px-4 py-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
            <BellRing size={16} aria-hidden="true" />
            Modo alerta activo en el perfil
          </p>
          <button
            type="button"
            onClick={deactivate}
            className="inline-flex min-h-9 items-center rounded-md bg-danger-soft px-3 text-xs font-semibold text-danger ring-1 ring-inset ring-danger-rule transition-colors hover:bg-danger hover:text-on-solid"
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

      <FoundPetPanel
        petName={petName}
        lastZone={resolved.zonaPerdida}
        whatsappNumber={whatsappNumber}
      />

      <LostPetInstructions petName={petName} instructions={emergency.instrucciones} />
    </div>
  );
}