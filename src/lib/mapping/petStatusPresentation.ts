import {
  CircleHelp,
  Heart,
  HeartCrack,
  HeartHandshake,
  Home,
  LifeBuoy,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isPetStatus, resolveEffectivePetState } from "@/lib/domain/petStatus";
import type { EffectivePetState, ResolveEffectivePetStateInput } from "@/lib/domain/petStatus";
import type { ToneName } from "@/lib/ui/tone";
import type { PetStatus } from "@/types/pet";

/** El tono es semántico: cada estado conserva siempre su significado cromático. */
export type PetStatusTone = ToneName;

export type PetStatusMeta = {
  label: string;
  description: string;
  tone: PetStatusTone;
  icon: LucideIcon;
};

const metaByStatus: Record<PetStatus, PetStatusMeta> = {
  en_casa: {
    label: "En casa",
    description: "Está en casa y a salvo.",
    tone: "success",
    icon: Home,
  },
  perdido: {
    label: "Perdido",
    description: "Reportado como perdido: toda ayuda es bienvenida.",
    tone: "danger",
    icon: Search,
  },
  en_adopcion: {
    label: "En adopción",
    description: "Busca un hogar donde recibir todo el amor que merece.",
    tone: "adoption",
    icon: HeartHandshake,
  },
  adoptado: {
    label: "Adoptado",
    description: "Encontró un hogar y comparte su vida con una familia.",
    tone: "settled",
    icon: Heart,
  },
  rescatado: {
    label: "Rescatado",
    description: "Fue rescatado y ahora está a salvo.",
    tone: "rescue",
    icon: LifeBuoy,
  },
  fallecido: {
    label: "En memoria",
    description: "Su perfil se conserva con cariño como recuerdo.",
    tone: "muted",
    icon: HeartCrack,
  },
};

const FALLBACK_META: PetStatusMeta = {
  label: "Estado desconocido",
  description: "No pudimos determinar el estado actual de este perfil.",
  tone: "muted",
  icon: CircleHelp,
};

export function getPetStatusMeta(status: unknown): PetStatusMeta {
  return isPetStatus(status) ? metaByStatus[status] : FALLBACK_META;
}

export type PetStatusSectionKind = "lost-mode" | "banner" | "none";

export type PetStatusView = {
  effective: EffectivePetState;
  kind: PetStatusSectionKind;
};

export function resolvePetStatusView(input: ResolveEffectivePetStateInput): PetStatusView {
  const effective = resolveEffectivePetState(input);

  if (effective.isLost) {
    return { effective, kind: "lost-mode" };
  }

  if (effective.status === "en_casa") {
    return { effective, kind: "none" };
  }

  return { effective, kind: "banner" };
}