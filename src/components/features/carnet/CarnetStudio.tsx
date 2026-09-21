"use client";

import { useState } from "react";
import { CreditCard, FileOutput, KeyRound } from "lucide-react";
import { CarnetDocument } from "@/components/features/carnet/CarnetDocument";
import {
  CARNET_FORMATO_LABELS,
  CARNET_ORIENTACION_LABELS,
  toCarnetViewModel,
} from "@/lib/mapping/carnet";
import type {
  PhysicalPetCard,
  PhysicalPetCardFormato,
} from "@/types/carnet";

const FORMATO_ICONS: Record<PhysicalPetCardFormato, typeof KeyRound> = {
  tarjeta_imprimible: FileOutput,
  credencial: CreditCard,
  placa_dije: KeyRound,
};

type CarnetStudioProps = {
  petName: string;
  cards: Record<PhysicalPetCardFormato, PhysicalPetCard>;
};

/**
 * CarnetStudio: alternador de formato del carnet físico.
 *
 * Los tres formatos se construyen una sola vez en el servidor
 * (`buildPhysicalPetCard(pet, { formato })` en la página) para que el Core
 * decida orientación y metadatos de impresión; este componente solo cambia
 * qué variante se muestra y expone los metadatos para impresión
 * (especificación, no estilos).
 */
export function CarnetStudio({ petName, cards }: CarnetStudioProps) {
  const [formato, setFormato] = useState<PhysicalPetCardFormato>("tarjeta_imprimible");
  const card = cards[formato];
  const vm = toCarnetViewModel(card);

  return (
    <div className="space-y-5" aria-label={`Estudio del carnet físico de ${petName}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Formato del carnet">
          {(Object.keys(CARNET_FORMATO_LABELS) as PhysicalPetCardFormato[]).map((option) => {
            const Icon = FORMATO_ICONS[option];
            const isActive = option === formato;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFormato(option)}
                className={[
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-emerald-500 text-white shadow-[0_10px_22px_rgba(16,185,129,0.28)]"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
                {CARNET_FORMATO_LABELS[option]}
              </button>
            );
          })}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-extrabold text-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:ring-1 dark:ring-gray-800">
          Orientación: {CARNET_ORIENTACION_LABELS[vm.orientacion]}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {vm.formatoDescription}
      </p>

      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
        Referencia de impresión · QR mínimo {card.print.qrMinimoMm} mm
      </p>

      <CarnetDocument card={card} />
    </div>
  );
}