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
import type { PetStatus } from "@/types/pet";

export type PetStatusTone = "mint" | "rose" | "purple" | "yellow" | "gray";

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
    tone: "mint",
    icon: Home,
  },
  perdido: {
    label: "Perdido",
    description: "Reportado como perdido: toda ayuda es bienvenida.",
    tone: "rose",
    icon: Search,
  },
  en_adopcion: {
    label: "En adopción",
    description: "Busca un hogar donde recibir todo el amor que merece.",
    tone: "purple",
    icon: HeartHandshake,
  },
  adoptado: {
    label: "Adoptado",
    description: "Encontró un hogar y comparte su vida con una familia.",
    tone: "mint",
    icon: Heart,
  },
  rescatado: {
    label: "Rescatado",
    description: "Fue rescatado y ahora está a salvo.",
    tone: "yellow",
    icon: LifeBuoy,
  },
  fallecido: {
    label: "En memoria",
    description: "Su perfil se conserva con cariño como recuerdo.",
    tone: "gray",
    icon: HeartCrack,
  },
};

const FALLBACK_META: PetStatusMeta = {
  label: "Estado desconocido",
  description: "No pudimos determinar el estado actual de este perfil.",
  tone: "gray",
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