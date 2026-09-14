"use client";

import { BellRing } from "lucide-react";
import { formatMexicanDate } from "@/lib/dateFormat";
import { useLostAlerts } from "@/lib/useLostAlerts";
import { LostPetBanner } from "./LostPetBanner";
import { LostPetInstructions } from "./LostPetInstructions";

type LostModeAlertSectionsProps = {
  petId: string;
  petName: string;
  staticLost: boolean;
  staticMessage: string | null;
  staticLostDate: string | null;
  staticLostZone: string | null;
  staticReward: number | null;
  staticInstructions: ReadonlyArray<string>;
};

export function LostModeAlertSections({
  petId,
  petName,
  staticLost,
  staticMessage,
  staticLostDate,
  staticLostZone,
  staticReward,
  staticInstructions,
}: LostModeAlertSectionsProps) {
  const { alert, deactivate } = useLostAlerts(petId);

  const isLost = alert?.active === true || staticLost;

  if (!isLost) return null;

  const lostZone = alert?.zonaPerdida || staticLostZone;
  const lostDate = alert?.fechaPerdida
    ? formatMexicanDate(alert.fechaPerdida) ?? alert.fechaPerdida
    : staticLostDate;
  const reward = alert?.recompensa ?? staticReward;
  const message = alert?.mensaje ?? staticMessage;

  return (
    <div className="space-y-6">
      {alert?.active === true ? (
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
        message={message}
        lostDate={lostDate}
        lostZone={lostZone}
        reward={reward}
      />

      <LostPetInstructions petName={petName} instructions={staticInstructions} />
    </div>
  );
}