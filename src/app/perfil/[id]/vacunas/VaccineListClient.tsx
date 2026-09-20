"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { VaccineDetailCard } from "@/components/features/pet-profile/VaccineDetailCard";
import {
  filterVaccines,
  VACCINE_STATUS_ALL,
  type VaccineStatusFilter,
} from "@/lib/domain/vaccine";
import { toVaccineItemViewModel } from "@/lib/mapping/health";
import type { PetDocument, PetVaccine } from "@/types/pet";

type VaccineListClientProps = {
  petName: string;
  vaccines: PetVaccine[];
  documents: PetDocument[];
};

type FilterOption = {
  value: VaccineStatusFilter;
  label: string;
  activeTones: string;
  chipTones: string;
};

const FILTER_OPTIONS: readonly FilterOption[] = [
  {
    value: VACCINE_STATUS_ALL,
    label: "Todas",
    activeTones: "bg-gray-950 text-white ring-gray-950",
    chipTones: "bg-white text-gray-700 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700",
  },
  {
    value: "al_dia",
    label: "Al día",
    activeTones: "bg-emerald-600 text-white ring-emerald-600",
    chipTones: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-800",
  },
  {
    value: "proxima_dosis",
    label: "Próxima dosis",
    activeTones: "bg-amber-600 text-white ring-amber-600",
    chipTones: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-800",
  },
  {
    value: "vencida",
    label: "Vencidas",
    activeTones: "bg-rose-600 text-white ring-rose-600",
    chipTones: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-800",
  },
];

export function VaccineListClient({ petName, vaccines, documents }: VaccineListClientProps) {
  const [status, setStatus] = useState<VaccineStatusFilter>(VACCINE_STATUS_ALL);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterVaccines(vaccines, { status, query }),
    [vaccines, status, query],
  );

  const viewModels = useMemo(
    () => filtered.map((vaccine) => toVaccineItemViewModel(vaccine, documents)),
    [filtered, documents],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div
          role="group"
          aria-label="Filtrar vacunas por estado"
          className="flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                aria-pressed={isActive}
                className={[
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition",
                  isActive ? option.activeTones : option.chipTones,
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="relative block">
          <span className="sr-only">Buscar vacuna por nombre, lote, veterinario u origen</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, lote, veterinario…"
            className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-bold text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-600 dark:focus:ring-emerald-800"
          />
          {query !== "" ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <SearchX size={18} aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </div>

      {vaccines.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
          Aún no se han registrado vacunas para {petName}.
        </p>
      ) : null}

      {viewModels.length > 0 ? (
        <div className="space-y-4">
          {viewModels.map((vaccine) => (
            <VaccineDetailCard key={vaccine.id} vaccine={vaccine} />
          ))}
        </div>
      ) : null}

      {vaccines.length > 0 && viewModels.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-lg font-extrabold text-gray-950 dark:text-white">
            Sin resultados
          </p>
          <p className="mx-auto mt-1 max-w-md font-semibold leading-6 text-gray-600 dark:text-gray-300">
            Ninguna vacuna coincide con el estado o la búsqueda actual.
            {status !== VACCINE_STATUS_ALL ? ` Estado seleccionado: ${FILTER_OPTIONS.find((o) => o.value === status)?.label ?? ""}.` : ""}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus(VACCINE_STATUS_ALL);
              setQuery("");
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-extrabold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
          >
            Mostrar todas
          </button>
        </div>
      ) : null}

      {viewModels.length > 0 ? (
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {viewModels.length === 1 ? "1 vacuna" : `${viewModels.length} vacunas`} en esta vista · estado según el carnet.
        </p>
      ) : null}
    </div>
  );
}