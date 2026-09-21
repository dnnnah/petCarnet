import Link from "next/link";
import { ArrowRight, ClipboardPlus, HeartPulse } from "lucide-react";
import { toCompletenessViewModel } from "@/lib/mapping/health";
import type { PetProfile } from "@/types/pet";

type HealthExpedientePreviewProps = {
  pet: PetProfile;
};

type DocStatProps = {
  label: string;
  value: React.ReactNode;
  accent: string;
};

function DocStat({ label, value, accent }: DocStatProps) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <span className={`block text-3xl font-black ${accent}`}>{value}</span>
      <span className="mt-1 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </span>
    </div>
  );
}

/**
 * HealthExpedientePreview: vista tipo documento del expediente de salud.
 *
 * Solo cambia la presentación (sigue siendo un desglose de los mismos datos:
 * totales registrados y completitud). Mantiene el contrato original
 * (props `{ pet: PetProfile }` y mismo contenido) para no duplicar reglas.
 */
export function HealthExpedientePreview({ pet }: HealthExpedientePreviewProps) {
  const completeness = toCompletenessViewModel(pet);
  const { registered } = completeness;

  return (
    <article
      aria-label="Expediente de salud de la mascota"
      className="overflow-hidden rounded-[1.75rem] bg-white text-gray-900 shadow-[0_28px_70px_rgba(17,24,39,0.1)] ring-1 ring-gray-200"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-emerald-500 px-6 py-5 sm:px-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-700">
            PetCarnet
          </p>
          <h2 className="flex items-center gap-2.5 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <HeartPulse size={19} aria-hidden="true" />
            </span>
            Expediente de salud
          </h2>
        </div>
        <span
          className={[
            "inline-flex rounded-full px-3.5 py-1.5 text-sm font-black ring-1",
            completeness.complete
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : completeness.hasRecords
                ? "bg-amber-50 text-amber-800 ring-amber-200"
                : "bg-gray-50 text-gray-500 ring-gray-200",
          ].join(" ")}
        >
          {completeness.complete
            ? "Expediente completo"
            : completeness.hasRecords
              ? `${completeness.totalMissing} dato(s) faltante(s)`
              : "Sin registros"}
        </span>
      </header>

      {completeness.hasRecords ? (
        <div className="p-6 sm:p-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <DocStat label="Vacunas" value={registered.vacunas} accent="text-violet-700" />
            <DocStat label="Desparasitaciones" value={registered.desparasitaciones} accent="text-teal-700" />
            <DocStat label="Consultas" value={registered.consultas} accent="text-sky-700" />
            <DocStat
              label={completeness.complete ? "Completitud" : "Faltantes"}
              value={completeness.complete ? "✓" : completeness.totalMissing}
              accent={completeness.complete ? "text-emerald-700" : "text-amber-700"}
            />
          </dl>
          <p className="mt-6 border-t border-gray-100 pt-5 text-sm font-semibold leading-6 text-gray-600">
            {completeness.complete
              ? `El expediente de ${pet.mascota.nombre} está completo y listo para tu veterinario.`
              : `Hay ${completeness.totalMissing} datos de salud sin llenar en ${pet.mascota.nombre}.`}
          </p>
        </div>
      ) : (
        <div className="p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 text-gray-400 ring-1 ring-gray-200">
            <ClipboardPlus size={26} aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold leading-7 text-gray-600">
            Aún no hay vacunas, desparasitaciones ni consultas registradas para{" "}
            {pet.mascota.nombre}. El expediente aparecerá aquí cuando se agregue
            información de salud.
          </p>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-8">
        <p className="text-xs font-extrabold text-gray-400">
          {pet.identificacion.codigoPublico
            ? `ID PetCarnet · ${pet.identificacion.codigoPublico}`
            : "ID PetCarnet · Sin código"}
        </p>
        <Link
          href={`/perfil/${pet.id}/salud`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Ver expediente completo
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}