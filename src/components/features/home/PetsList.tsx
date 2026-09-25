"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PetSpeciesIcon } from "@/lib/petIcon";
import { cx } from "@/lib/ui/tone";
import type { PetProfile } from "@/types/pet";

type PetsListProps = {
  pets: ReadonlyArray<PetProfile>;
};

const SPECIES_FILTERS = ["Todos", "Perro", "Gato"] as const;

export function PetsList({ pets }: PetsListProps) {
  const [species, setSpecies] = useState<string>("Todos");

  const filtered =
    species === "Todos" ? pets : pets.filter((pet) => pet.mascota.especie === species);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Filtrar mascotas por especie"
          value={species}
          onChange={setSpecies}
          options={SPECIES_FILTERS.map((option) => ({ value: option, label: option }))}
        />
        <span aria-live="polite" className="ml-auto text-sm text-ink-3">
          {filtered.length} {filtered.length === 1 ? "mascota" : "mascotas"}
        </span>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {filtered.map((pet) => {
            const lost = pet.emergencia.perdido;

            return (
              <li key={pet.id}>
                <Link
                  href={`/perfil/${pet.id}`}
                  className="group flex min-h-16 items-center gap-3.5 py-3.5 transition-colors duration-150 hover:bg-surface sm:px-2"
                >
                  <span
                    className={cx(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-md",
                      lost
                        ? "bg-danger-soft text-danger"
                        : "bg-brand-soft text-brand"
                    )}
                    aria-hidden="true"
                  >
                    <PetSpeciesIcon species={pet.mascota.especie} size={20} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-display text-lg font-semibold leading-tight text-ink">
                        {pet.mascota.nombre}
                      </span>
                      {lost ? (
                        <Pill tone="danger" size="sm">
                          Perdido
                        </Pill>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-2">
                      {pet.mascota.especie}
                      {pet.mascota.raza ? ` · ${pet.mascota.raza}` : ""}
                    </span>
                  </span>

                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg bg-sunken p-6 text-center text-sm text-ink-2">
          No hay mascotas de esta especie por ahora.
        </p>
      )}
    </div>
  );
}
