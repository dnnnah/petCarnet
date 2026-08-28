import { Check, ClipboardX, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VaccineStatus } from "@/types/pet";

export type VaccineStatusLabel =
  | "Al día"
  | "Próxima dosis"
  | "Vencida";

export type VaccineStatusMeta = {
  label: VaccineStatusLabel;
  icon: LucideIcon;
  tones: string;
  iconTones: string;
};

const statusConfig: Record<VaccineStatus, VaccineStatusMeta> = {
  al_dia: {
    label: "Al día",
    icon: Check,
    tones: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    iconTones: "bg-emerald-100 text-emerald-600 ring-emerald-200",
  },
  proxima_dosis: {
    label: "Próxima dosis",
    icon: Clock,
    tones: "bg-amber-50 text-amber-700 ring-amber-200",
    iconTones: "bg-amber-100 text-amber-600 ring-amber-200",
  },
  vencida: {
    label: "Vencida",
    icon: ClipboardX,
    tones: "bg-rose-50 text-rose-700 ring-rose-200",
    iconTones: "bg-rose-100 text-rose-600 ring-rose-200",
  },
};

export function getVaccineStatusMeta(status: VaccineStatus): VaccineStatusMeta {
  return statusConfig[status];
}
