"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { VaccineDetailCard } from "@/components/features/pet-profile/VaccineDetailCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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

const FILTER_OPTIONS: ReadonlyArray<{
  value: VaccineStatusFilter;
  label: string;
}> = [
  { value: VACCINE_STATUS_ALL, label: "Todas" },
  { value: "al_dia", label: "Al día" },
  { value: "proxima_dosis", label: "Próxima dosis" },
  { value: "vencida", label: "Vencidas" },
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
        <SegmentedControl
          label="Filtrar vacunas por estado"
          value={status}
          onChange={setStatus}
          options={FILTER_OPTIONS}
        />

        <label className="relative block">
          <span className="sr-only">Buscar vacuna por nombre, lote, veterinario u origen</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, lote, veterinario…"
            className="min-h-12 w-full rounded-md border border-rule bg-surface pl-11 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand-rule focus:ring-2 focus:ring-brand-soft"
          />
          {query !== "" ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
            >
              <SearchX size={18} aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </div>

      {vaccines.length === 0 ? (
        <p className="rounded-md border border-dashed border-rule-strong p-6 text-center text-sm leading-6 text-ink-2">
          Aún no se han registrado vacunas para {petName}.
        </p>
      ) : null}

      {viewModels.length > 0 ? (
        <div className="space-y-3">
          {viewModels.map((vaccine) => (
            <VaccineDetailCard key={vaccine.id} vaccine={vaccine} />
          ))}
        </div>
      ) : null}

      {vaccines.length > 0 && viewModels.length === 0 ? (
        <div className="rounded-md border border-rule bg-surface p-8 text-center">
          <p className="text-lg font-semibold text-ink">Sin resultados</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink-2">
            Ninguna vacuna coincide con el estado o la búsqueda actual.
            {status !== VACCINE_STATUS_ALL
              ? ` Estado seleccionado: ${FILTER_OPTIONS.find((o) => o.value === status)?.label ?? ""}.`
              : ""}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus(VACCINE_STATUS_ALL);
              setQuery("");
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-2"
          >
            Mostrar todas
          </button>
        </div>
      ) : null}

      {viewModels.length > 0 ? (
        <p className="text-sm text-ink-2">
          {viewModels.length === 1 ? "1 vacuna" : `${viewModels.length} vacunas`} en esta vista ·
          estado según el carnet.
        </p>
      ) : null}
    </div>
  );
}
