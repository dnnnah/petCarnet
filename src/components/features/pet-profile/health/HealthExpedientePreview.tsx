import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toCompletenessViewModel } from "@/lib/mapping/health";
import type { PetProfile } from "@/types/pet";

type HealthExpedientePreviewProps = {
  pet: PetProfile;
};

export function HealthExpedientePreview({ pet }: HealthExpedientePreviewProps) {
  const completeness = toCompletenessViewModel(pet);
  const { registered } = completeness;

  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
            <HeartPulse size={20} />
          </span>
          Expediente de salud
        </h2>
        <Link
          href={`/perfil/${pet.id}/salud`}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          Ver expediente completo
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {completeness.hasRecords ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-center ring-1 ring-violet-100 dark:bg-violet-500/10 dark:ring-violet-800">
              <span className="block text-2xl font-black text-violet-700 dark:text-violet-300">
                {registered.vacunas}
              </span>
              <span className="mt-0.5 block text-xs font-extrabold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                Vacunas
              </span>
            </div>
            <div className="rounded-2xl bg-teal-50 px-4 py-3 text-center ring-1 ring-teal-100 dark:bg-teal-500/10 dark:ring-teal-800">
              <span className="block text-2xl font-black text-teal-700 dark:text-teal-300">
                {registered.desparasitaciones}
              </span>
              <span className="mt-0.5 block text-xs font-extrabold uppercase tracking-wide text-teal-500 dark:text-teal-400">
                Desparasitaciones
              </span>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-center ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-800">
              <span className="block text-2xl font-black text-sky-700 dark:text-sky-300">
                {registered.consultas}
              </span>
              <span className="mt-0.5 block text-xs font-extrabold uppercase tracking-wide text-sky-500 dark:text-sky-400">
                Consultas
              </span>
            </div>
            <div
              className={[
                "rounded-2xl px-4 py-3 text-center ring-1",
                completeness.complete
                  ? "bg-emerald-50 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-800"
                  : "bg-amber-50 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-800",
              ].join(" ")}
            >
              <span
                className={[
                  "block text-2xl font-black",
                  completeness.complete
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300",
                ].join(" ")}
              >
                {completeness.complete ? "✓" : completeness.totalMissing}
              </span>
              <span
                className={[
                  "mt-0.5 block text-xs font-extrabold uppercase tracking-wide",
                  completeness.complete
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-amber-500 dark:text-amber-400",
                ].join(" ")}
              >
                {completeness.complete ? "Completo" : "Faltantes"}
              </span>
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
            {completeness.complete
              ? `El expediente de ${pet.mascota.nombre} está completo y listo para tu veterinario.`
              : `Hay ${completeness.totalMissing} datos de salud sin llenar en ${pet.mascota.nombre}.`}
          </p>
        </>
      ) : (
        <p className="mt-5 font-semibold leading-7 text-gray-600 dark:text-gray-300">
          Aún no hay vacunas, desparasitaciones ni consultas registradas para{" "}
          {pet.mascota.nombre}. El expediente aparecerá aquí cuando se agregue
          información de salud.
        </p>
      )}
    </GlassCard>
  );
}