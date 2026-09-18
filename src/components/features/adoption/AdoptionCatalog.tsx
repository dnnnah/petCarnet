"use client";

import { useMemo, useState } from "react";
import { Dog, HeartHandshake, MapPin, Search } from "lucide-react";
import { AdoptionPetCard } from "./AdoptionPetCard";
import type { AdoptionCatalogCard } from "@/lib/mapping/adoptionPresentation";

const SPECIES_FILTERS = ["Todos", "Perro", "Gato"] as const;

export type ShelterFilterOption = {
  id: string;
  label: string;
};

type AdoptionCatalogProps = {
  cards: AdoptionCatalogCard[];
  shelters: ShelterFilterOption[];
};

export function AdoptionCatalog({ cards, shelters }: AdoptionCatalogProps) {
  const [species, setSpecies] = useState<(typeof SPECIES_FILTERS)[number]>("Todos");
  const [shelterId, setShelterId] = useState("todos");

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      const matchesSpecies = species === "Todos" || card.species === species;
      const matchesShelter =
        shelterId === "todos" ||
        (shelterId === "__ninguno" ? card.shelterId === null : card.shelterId === shelterId);
      return matchesSpecies && matchesShelter;
    });
  }, [cards, species, shelterId]);

  const resultLabel =
    filtered.length === 1 ? "1 mascota en adopción" : `${filtered.length} mascotas en adopción`;

  return (
    <section aria-labelledby="adopciones-titulo">
      <div className="flex flex-col gap-4">
        <h2 id="adopciones-titulo" className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
          Mascotas en adopción
        </h2>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por especie">
          {SPECIES_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSpecies(option)}
              aria-pressed={species === option}
              className={[
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                species === option
                  ? "bg-violet-600 text-white shadow-[0_10px_22px_rgba(124,58,237,0.25)]"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-violet-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-violet-500/10",
              ].join(" ")}
            >
              {option === "Perro" ? <Dog size={16} aria-hidden="true" /> : null}
              {option === "Gato" ? <HeartHandshake size={16} aria-hidden="true" /> : null}
              {option}
            </button>
          ))}

          <label className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
            <span className="sr-only">Filtrar por refugio</span>
            <MapPin size={16} aria-hidden="true" />
            <select
              value={shelterId}
              onChange={(event) => setShelterId(event.target.value)}
              className="cursor-pointer bg-transparent font-extrabold text-gray-700 outline-none dark:text-gray-200"
            >
              <option value="todos">Todos los refugios</option>
              {shelters.map((shelter) => (
                <option key={shelter.id} value={shelter.id}>
                  {shelter.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm font-extrabold uppercase tracking-wider text-gray-400" role="status">
        {resultLabel}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 grid min-h-64 place-items-center rounded-[1.6rem] bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="max-w-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Search size={26} aria-hidden="true" />
            </span>
            <p className="mt-4 text-lg font-extrabold text-gray-900 dark:text-white">
              No hay mascotas con esos filtros
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Prueba cambiando la especie o el refugio para ver más perfiles en adopción.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Resultados del catálogo de adopción"
        >
          {filtered.map((card) => (
            <AdoptionPetCard key={card.petId} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}