"use client";

import type { PetDocumentCategory } from "@/types/pet";

export type DocumentFilter = "todos" | PetDocumentCategory;

type DocumentFiltersProps = {
  counts: Record<DocumentFilter, number>;
  active: DocumentFilter;
  onChange: (filter: DocumentFilter) => void;
};

const filters: { value: DocumentFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "vacunas", label: "Vacunas" },
  { value: "veterinario", label: "Veterinario" },
  { value: "identificacion", label: "Identificación" },
  { value: "salud", label: "Salud" },
  { value: "foto", label: "Fotos" },
  { value: "otro", label: "Otros" },
];

const tones: Record<DocumentFilter, string> = {
  todos: "bg-gray-100 text-gray-700 ring-gray-200",
  vacunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  veterinario: "bg-blue-50 text-blue-700 ring-blue-200",
  identificacion: "bg-violet-50 text-violet-700 ring-violet-200",
  salud: "bg-pink-50 text-pink-700 ring-pink-200",
  foto: "bg-amber-50 text-amber-700 ring-amber-200",
  otro: "bg-gray-50 text-gray-700 ring-gray-200",
};

const activeTones: Record<DocumentFilter, string> = {
  todos: "bg-gray-900 text-white ring-gray-900",
  vacunas: "bg-emerald-600 text-white ring-emerald-600",
  veterinario: "bg-blue-600 text-white ring-blue-600",
  identificacion: "bg-violet-600 text-white ring-violet-600",
  salud: "bg-pink-600 text-white ring-pink-600",
  foto: "bg-amber-600 text-white ring-amber-600",
  otro: "bg-gray-700 text-white ring-gray-700",
};

export function DocumentFilters({ counts, active, onChange }: DocumentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const count = counts[filter.value];
        if (filter.value !== "todos" && count === 0) return null;
        const isActive = active === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition",
              isActive ? activeTones[filter.value] : tones[filter.value],
            ].join(" ")}
          >
            {filter.label}
            <span className={["rounded-full px-2 py-0.5 text-xs", isActive ? "bg-white/20" : "bg-white ring-1 ring-current/10"].join(" ")}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
