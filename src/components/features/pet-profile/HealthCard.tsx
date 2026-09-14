"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Heart, Pill, PawPrint } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type HealthCardProps = {
  health: {
    allergies: ReadonlyArray<string>;
    conditions: ReadonlyArray<string>;
    medications: ReadonlyArray<string>;
    diet: string;
    behavior: string;
  };
};

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm font-bold italic text-gray-400">{text}</p>
  );
}

export function HealthCard({ health }: HealthCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasAllergies = health.allergies.length > 0 && !(health.allergies.length === 1 && health.allergies[0] === "Ninguna registrada");
  const hasConditions = health.conditions.length > 0 && !(health.conditions.length === 1 && health.conditions[0] === "Ninguna");
  const hasMedications = health.medications.length > 0;
  const hasDiet = health.diet.trim().length > 0;
  const hasAnyDetail = hasMedications || hasDiet;

  return (
    <GlassCard className="relative h-full overflow-hidden p-6 lg:p-7">
      <div className="absolute right-9 top-24 text-amber-100">
        <PawPrint size={34} fill="currentColor" />
      </div>
      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950 dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-pink-500 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-pink-100">
          <Heart size={21} />
        </span>
        Salud Importante
      </h2>

      <div className="relative mt-7 space-y-5">
        <div>
          <span className="inline-flex rounded-full bg-pink-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 dark:bg-pink-500/15 dark:text-gray-100 ring-1 ring-pink-200/70">
            Alergias
          </span>
          {hasAllergies ? (
            <ul className="mt-3 list-disc space-y-1 pl-6 font-semibold text-gray-800 dark:text-gray-100">
              {health.allergies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><EmptyState text="Sin alergias registradas" /></div>
          )}
        </div>

        <div>
          <span className="inline-flex rounded-full bg-amber-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 dark:bg-amber-500/15 dark:text-gray-100 ring-1 ring-amber-200/70">
            Condiciones
          </span>
          {hasConditions ? (
            <ul className="mt-3 list-disc space-y-1 pl-6 font-semibold text-gray-800 dark:text-gray-100">
              {health.conditions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><EmptyState text="Sin condiciones registradas" /></div>
          )}
        </div>

        <div>
          <span className="inline-flex rounded-full bg-blue-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 dark:bg-blue-500/15 dark:text-gray-100 ring-1 ring-blue-200/70">
            Comportamiento
          </span>
          <p className="mt-3 font-semibold leading-7 text-gray-800 dark:text-gray-100">{health.behavior}</p>
        </div>

        {hasAnyDetail ? (
          <>
            {expanded ? (
              <div className="space-y-5">
                {hasMedications ? (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 dark:bg-violet-500/15 dark:text-gray-100 ring-1 ring-violet-200/70">
                      <Pill size={14} />
                      Medicamentos
                    </span>
                    <ul className="mt-3 list-disc space-y-1 pl-6 font-semibold text-gray-800 dark:text-gray-100">
                      {health.medications.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {hasDiet ? (
                  <div>
                    <span className="inline-flex rounded-full bg-orange-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 dark:bg-orange-500/15 dark:text-gray-100 ring-1 ring-orange-200/70">
                      Dieta especial
                    </span>
                    <p className="mt-3 font-semibold leading-7 text-gray-800 dark:text-gray-100">{health.diet}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              onClick={() => setExpanded(!expanded)}
              className="mx-auto flex items-center gap-2 text-sm font-extrabold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {expanded ? "Ocultar detalles" : "Ver más detalles"}
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </>
        ) : null}
      </div>
    </GlassCard>
  );
}
