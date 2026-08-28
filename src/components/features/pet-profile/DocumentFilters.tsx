"use client";

import { getDocumentFilterList } from "@/lib/domain/documentCategory";
import type { DocumentFilterValue } from "@/lib/domain/documentCategory";

export type DocumentFilter = DocumentFilterValue;

type DocumentFiltersProps = {
  counts: Record<DocumentFilter, number>;
  active: DocumentFilter;
  onChange: (filter: DocumentFilter) => void;
};

const filters = getDocumentFilterList();

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
              isActive ? filter.activeTones : filter.chipTones,
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
