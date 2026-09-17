"use client";

import { Badge } from "@/components/ui/Badge";
import { resolveEffectivePetState } from "@/lib/domain/petStatus";
import { getPetStatusMeta } from "@/lib/mapping/petStatusPresentation";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { PetEmergency, PetStatus } from "@/types/pet";

type PetStatusBadgeProps = {
  petId: string;
  emergency: PetEmergency;
  status: PetStatus;
};

export function PetStatusBadge({ petId, emergency, status }: PetStatusBadgeProps) {
  const { alert } = useLostAlerts(petId);
  const effective = resolveEffectivePetState({ estado: status, emergencia: emergency, alert });
  const meta = getPetStatusMeta(effective.status);
  const StatusIcon = meta.icon;

  return (
    <Badge tone={meta.tone} icon={<StatusIcon size={18} aria-hidden="true" />}>
      {meta.label}
    </Badge>
  );
}