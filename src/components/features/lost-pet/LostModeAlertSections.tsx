"use client";

import { BellRing, Smartphone } from "lucide-react";
import { formatMexicanDate } from "@/lib/dateFormat";
import { resolveLostState } from "@/lib/domain/emergency";
import { useLostAlerts } from "@/lib/useLostAlerts";
import { LOST_MODE_LOCAL_COPY } from "@/lib/pwa/copy";
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

      {/* El modo alerta vive en el almacenamiento local de **este** dispositivo:
          no hay servidor que lo difunda. Sin esta nota, "activa el modo alerta
          en el perfil" se lee como si el resto del mundo viera el cambio, y en
          una emergencia eso es exactamente la conclusión equivocada. Se dice
          sin miedo y con la salida al alcance. */}
      {alert !== null ? (
        <p className="flex items-start gap-2.5 rounded-md border border-rule bg-sunken px-4 py-3 text-sm leading-6 text-ink-2">
          <Smartphone size={16} aria-hidden="true" className="mt-1 shrink-0 text-ink-3" />
          <span>
            <span className="font-semibold text-ink">{LOST_MODE_LOCAL_COPY.aviso}</span>{" "}
            {LOST_MODE_LOCAL_COPY.detalle}
          </span>
        </p>
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