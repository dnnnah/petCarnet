"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { PetSpeciesIcon } from "@/lib/petIcon";
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
    <>
      <div
        className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide rounded-full"
        role="group"
        aria-label="Filtrar mascotas por especie"
      >
        {SPECIES_FILTERS.map((option) => {
          const isActive = species === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setSpecies(option)}
              aria-pressed={isActive}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition",
                isActive
                  ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.24)]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-400">
        {filtered.length} {filtered.length === 1 ? "mascota" : "mascotas"} {species === "Todos" ? "" : `· ${species}`}
      </p>

      <div className="mt-4 grid gap-3">
        {filtered.map((pet, index) => (
          <Link
            key={pet.id}
            href={`/perfil/${pet.id}`}
            className={[
              "group flex items-center justify-between rounded-3xl border p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5",
              pet.emergencia.perdido
                ? "border-2 border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 shadow-[0_16px_34px_rgba(225,29,72,0.14)] ring-2 ring-rose-100 hover:border-rose-400 dark:from-rose-950/40 dark:to-amber-950/30 dark:ring-rose-900"
                : "border-gray-100 bg-white hover:border-emerald-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "grid h-11 w-11 place-items-center rounded-2xl",
                  index % 2 === 0
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-pink-100 text-pink-500 dark:bg-pink-500/15 dark:text-pink-400",
                ].join(" ")}
              >
                <PetSpeciesIcon species={pet.mascota.especie} size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-gray-950 dark:text-white">{pet.mascota.nombre}</p>
                  {pet.emergencia.perdido ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-extrabold uppercase text-white shadow-[0_8px_18px_rgba(225,29,72,0.22)] ring-2 ring-white dark:ring-gray-900">
                      <AlertTriangle size={12} />
                      Perdido
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {pet.mascota.especie}
                </p>
              </div>
            </div>
            <ArrowRight
              className="text-gray-300 transition group-hover:text-emerald-500 dark:text-gray-600"
              size={20}
            />
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          No hay mascotas de esta especie por ahora.
        </p>
      ) : null}
    </>
  );
}