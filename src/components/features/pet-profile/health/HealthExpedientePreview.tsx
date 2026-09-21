import Link from "next/link";
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardPlus,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { toCompletenessViewModel } from "@/lib/mapping/health";
import type { PetProfile } from "@/types/pet";

type HealthExpedientePreviewProps = {
  pet: PetProfile;
};

type DocStatProps = {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
  iconTone: string;
};

function DocStat({ label, value, icon, accent, iconTone }: DocStatProps) {
  return (
    <div className="relative rounded-2xl border border-transparent px-4 py-4">
      <span className="pointer-events-none absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-current to-transparent opacity-60" aria-hidden="true" />
      <span className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] ${accent}`}>
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${iconTone}`}>{icon}</span>
        {label}
      </span>
      <span className={`mt-3 block text-4xl font-black tracking-tight ${accent}`}>{value}</span>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "emerald" | "teal" | "sky" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-800",
    teal: "bg-teal-50 text-teal-700 ring-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-800",
    sky: "bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-800",
    amber: "bg-amber-50 text-amber-800 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-800",
  };
  return (
    <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em] text-gray-900 dark:text-gray-100">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
        {icon}
      </span>
      {title}
    </h3>
  );
}

/**
 * HealthExpedientePreview: preview del expediente de salud en el perfil base.
 *
 * Presenta los mismos datos funcionales del Core (totales de vacunas,
 * desparasitaciones y consultas más su completitud, vía
 * `toCompletenessViewModel`) con una presentación tipo documento: encabezado
 * y pie de documento, bloques por sección con colores de jerarquía,
 * separadores y chips de campos faltantes. No cambia el contrato
 * `{ pet: PetProfile }` ni reimplementa reglas de negocio.
 */
export function HealthExpedientePreview({ pet }: HealthExpedientePreviewProps) {
  const completeness = toCompletenessViewModel(pet);
  const { registered } = completeness;
  const hasRecords = completeness.hasRecords;

  const completeTone =
    completeness.complete
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800"
      : hasRecords
        ? "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-800"
        : "bg-gray-50 text-gray-500 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700";

  const completeLabel = completeness.complete
    ? "Expediente completo"
    : hasRecords
      ? `${completeness.totalMissing} dato(s) faltante(s)`
      : "Sin registros";

  return (
    <article
      aria-label="Expediente de salud de la mascota"
      className="overflow-hidden rounded-[1.75rem] bg-white text-gray-900 shadow-[0_28px_70px_rgba(17,24,39,0.1)] ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
    >
      {/* Encabezado del documento */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-6 py-5 sm:px-8 dark:border-gray-800 dark:bg-gray-950">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-400">
            PetCarnet · Carnet Digital para Mascotas
          </p>
          <h2 className="mt-2 flex items-center gap-3 text-xl font-black tracking-tight text-gray-950 dark:text-gray-50">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
              <HeartPulse size={20} aria-hidden="true" />
            </span>
            Expediente de salud
          </h2>
        </div>
        <span
          className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-black ring-1 ${completeTone}`}
          role="status"
        >
          {completeLabel}
        </span>
      </header>

      <div className="p-6 sm:p-8">
        {/* Bloque de totales (sección 1) */}
        <section aria-label="Totales del expediente" className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4">
          <DocStat
            label="Vacunas"
            value={registered.vacunas}
            icon={<ShieldCheck size={14} aria-hidden="true" />}
            accent="text-emerald-700 dark:text-emerald-400"
            iconTone="bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:ring-emerald-800"
          />
          <DocStat
            label="Desparasitaciones"
            value={registered.desparasitaciones}
            icon={<Bug size={14} aria-hidden="true" />}
            accent="text-teal-700 dark:text-teal-400"
            iconTone="bg-teal-50 ring-1 ring-teal-100 dark:bg-teal-500/15 dark:ring-teal-800"
          />
          <DocStat
            label="Consultas"
            value={registered.consultas}
            icon={<Stethoscope size={14} aria-hidden="true" />}
            accent="text-sky-700 dark:text-sky-400"
            iconTone="bg-sky-50 ring-1 ring-sky-100 dark:bg-sky-500/15 dark:ring-sky-800"
          />
          <DocStat
            label={completeness.complete ? "Completitud" : "Faltantes"}
            value={completeness.complete ? "✓" : completeness.totalMissing}
            icon={<CheckCircle2 size={14} aria-hidden="true" />}
            accent={completeness.complete ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}
            iconTone={completeness.complete ? "bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:ring-emerald-800" : "bg-amber-50 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:ring-amber-800"}
          />
        </section>

        {/* Completitud (sección 2) */}
        <section aria-label="Completitud del expediente" className="mt-8 border-t border-gray-100 pt-7 dark:border-gray-800">
          <SectionHeading
            icon={<ClipboardPlus size={17} aria-hidden="true" />}
            title="Completitud del expediente"
            tone={completeness.complete ? "emerald" : hasRecords ? "amber" : "sky"}
          />

          {completeness.complete ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-800">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={20} aria-hidden="true" />
              <p className="font-extrabold text-emerald-800 dark:text-emerald-300">
                Toda la información registrada está completa y lista para tu veterinario.
              </p>
            </div>
          ) : hasRecords ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-extrabold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-800">
                  <TriangleAlert size={15} aria-hidden="true" />
                  {completeness.incompleteRecords} registro(s) con datos faltantes
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-extrabold text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                  {completeness.totalMissing} campo(s) pendiente(s)
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {completeness.items.map((item) => (
                  <li
                    key={`${item.kind}-${item.entityLabel}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60"
                  >
                    <p className="text-sm font-extrabold text-gray-950 dark:text-gray-100">{item.entityLabel}</p>
                    {item.missing.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.missing.map((field) => (
                          <span
                            key={field}
                            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200 dark:bg-gray-900 dark:text-amber-400 dark:ring-amber-800"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                Completar estos datos ayuda a que el carnet sea útil para tu veterinario.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-gray-200 p-4 text-sm font-semibold leading-6 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <ClipboardPlus className="mt-0.5 shrink-0 text-gray-400" size={18} aria-hidden="true" />
              Aún no hay vacunas, desparasitaciones ni consultas registradas para{" "}
              {pet.mascota.nombre}. El expediente aparecerá aquí cuando se agregue
              información de salud.
            </div>
          )}

          <p className="mt-6 border-t border-gray-100 pt-5 text-sm font-semibold leading-6 text-gray-600 dark:border-gray-800 dark:text-gray-400">
            {completeness.complete
              ? `El expediente de ${pet.mascota.nombre} está completo y listo para tu veterinario.`
              : hasRecords
                ? `Hay ${completeness.totalMissing} datos de salud sin llenar en ${pet.mascota.nombre}.`
                : `Sin registros de salud todavía para ${pet.mascota.nombre}.`}
          </p>
        </section>
      </div>

      {/* Pie del documento */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-8 dark:border-gray-800 dark:bg-gray-950">
        <p className="text-xs font-extrabold text-gray-500 dark:text-gray-400">
          {pet.identificacion.codigoPublico
            ? `ID PetCarnet · ${pet.identificacion.codigoPublico}`
            : "ID PetCarnet · Sin código"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
            Documento informativo
          </p>
          <Link
            href={`/perfil/${pet.id}/salud`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Ver expediente
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </article>
  );
}