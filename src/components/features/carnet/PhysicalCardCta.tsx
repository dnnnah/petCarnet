import Link from "next/link";
import { Sparkles } from "lucide-react";
import { CarnetDocument } from "@/components/features/carnet/CarnetDocument";
import { toCarnetViewModel } from "@/lib/mapping/carnet";
import type { PhysicalPetCard } from "@/types/carnet";

type PhysicalCardCtaProps = {
  petId: string;
  petName: string;
  card: PhysicalPetCard;
};

/**
 * Section del perfil: preview del carnet físico (una sola foto del documento
 * en su formato por defecto) con acceso al estudio de formatos. El modelo
 * llega ya construido por la página (server) desde el Core.
 */
export function PhysicalCardCta({ petId, petName, card }: PhysicalCardCtaProps) {
  const vm = toCarnetViewModel(card);

  return (
    <section className="space-y-4" aria-labelledby="carnet-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id="carnet-heading"
            className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
              <Sparkles size={19} aria-hidden="true" />
            </span>
            Carnet físico
          </h2>
          <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
            La identidad física de {petName} lista para imprimir o compartir.
          </p>
        </div>
        <Link
          href={`/perfil/${petId}/carnet`}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          <Sparkles size={16} aria-hidden="true" />
          Estudio del carnet
        </Link>
      </div>

      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
        {vm.formatoLabel} · orientación {vm.orientacionLabel.toLowerCase()} · QR mínimo {card.print.qrMinimoMm} mm
      </p>

      <CarnetDocument card={card} />
    </section>
  );
}