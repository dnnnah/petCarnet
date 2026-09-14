import {
  FileImage,
  FileText,
  HeartPulse,
  IdCard,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PetDocumentCategory } from "@/types/pet";

export type DocumentFilterValue = "todos" | PetDocumentCategory;

export type DocumentCategoryMeta = {
  value: PetDocumentCategory;
  label: string;
  icon: LucideIcon;
  chipTones: string;
  activeTones: string;
};

export type DocumentFilterMeta = {
  value: DocumentFilterValue;
  label: string;
  icon: LucideIcon;
  chipTones: string;
  activeTones: string;
};

const categoryConfig: Record<PetDocumentCategory, Omit<DocumentCategoryMeta, "value">> = {
  vacunas: {
    label: "Vacunas",
    icon: ShieldCheck,
    chipTones: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    activeTones: "bg-emerald-600 text-white ring-emerald-600",
  },
  veterinario: {
    label: "Veterinario",
    icon: Stethoscope,
    chipTones: "bg-blue-50 text-blue-700 ring-blue-200",
    activeTones: "bg-blue-600 text-white ring-blue-600",
  },
  identificacion: {
    label: "Identificación",
    icon: IdCard,
    chipTones: "bg-violet-50 text-violet-700 ring-violet-200",
    activeTones: "bg-violet-600 text-white ring-violet-600",
  },
  salud: {
    label: "Salud",
    icon: HeartPulse,
    chipTones: "bg-pink-50 text-pink-700 ring-pink-200",
    activeTones: "bg-pink-600 text-white ring-pink-600",
  },
  foto: {
    label: "Fotos",
    icon: FileImage,
    chipTones: "bg-amber-50 text-amber-700 ring-amber-200",
    activeTones: "bg-amber-600 text-white ring-amber-600",
  },
  otro: {
    label: "Otros",
    icon: FileText,
    chipTones: "bg-gray-50 text-gray-700 ring-gray-200",
    activeTones: "bg-gray-700 text-white ring-gray-700",
  },
};

const FILTER_ORDER: DocumentFilterValue[] = [
  "todos",
  "vacunas",
  "veterinario",
  "identificacion",
  "salud",
  "otro",
];

export function getDocumentCategoryMeta(
  category: PetDocumentCategory
): DocumentCategoryMeta {
  return { value: category, ...categoryConfig[category] };
}

export function getDocumentFilterList(): DocumentFilterMeta[] {
  return FILTER_ORDER.map((value) => {
    if (value === "todos") {
      return {
        value,
        label: "Todos",
        icon: FileText,
        chipTones: "bg-gray-100 text-gray-700 ring-gray-200",
        activeTones: "bg-gray-900 text-white ring-gray-900",
      };
    }
    const meta = categoryConfig[value];
    return { value, ...meta };
  });
}

export function getDocumentCategoryLabel(category: PetDocumentCategory) {
  return categoryConfig[category].label;
}
