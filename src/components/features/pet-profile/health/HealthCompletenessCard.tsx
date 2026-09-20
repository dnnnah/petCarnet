import { CheckCircle2, ClipboardList, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CompletenessViewModel } from "@/lib/mapping/health";

type HealthCompletenessCardProps = {
  petName: string;
  viewModel: CompletenessViewModel;
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 text-center dark:border-gray-800 dark:bg-gray-900/80">
      <span className="block text-2xl font-black text-gray-950 dark:text-white">{value}</span>
      <span className="mt-0.5 block text-xs font-extrabold uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
}

export function HealthCompletenessCard({ petName, viewModel }: HealthCompletenessCardProps) {
  const { registered } = viewModel;

  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6 lg:p-7">
      <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-violet-800">
          <ClipboardList size={20} />
        </span>
        Completitud del expediente
      </h2>

      {!viewModel.hasRecords ? (
        <div className="mt-6 rounded-3xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800">
            <ClipboardList size={28} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-gray-950 dark:text-white">
            Expediente de {petName} en blanco
          </p>
          <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
            Aún no hay vacunas, desparasitaciones ni consultas registradas. Este
            apartado solo mide los datos existentes, sin inventar resultados.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat value={registered.vacunas} label="Vacunas" />
            <Stat value={registered.desparasitaciones} label="Desparasitaciones" />
            <Stat value={registered.consultas} label="Consultas" />
          </div>

          {viewModel.complete ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-800">
              <CheckCircle2 className="shrink-0 text-emerald-600 dark:text-emerald-400" size={22} aria-hidden="true" />
              <p className="font-extrabold text-emerald-800 dark:text-emerald-300">
                Toda la información registrada está completa.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-800">
                  <TriangleAlert size={15} aria-hidden="true" />
                  {viewModel.incompleteRecords} registros con datos faltantes
                </span>
                {viewModel.totalMissing > 0 ? (
                  <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-700">
                    {viewModel.totalMissing} campos pendientes de llenado
                  </span>
                ) : null}
              </div>

              <ul className="mt-5 space-y-2">
                {viewModel.items.map((item) => (
                  <li
                    key={`${item.kind}-${item.entityLabel}`}
                    className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/80"
                  >
                    <p className="font-extrabold text-gray-950 dark:text-white">{item.entityLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Falta: {item.missing.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                Completar estos datos ayuda a que el carné sea útil para tu veterinario.
              </p>
            </>
          )}
        </>
      )}
    </GlassCard>
  );
}