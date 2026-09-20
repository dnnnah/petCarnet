import { Bug, CalendarDays, FileText, Package } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { DewormingSectionViewModel } from "@/lib/mapping/health";

type DewormingSectionProps = {
  petName: string;
  viewModel: DewormingSectionViewModel;
};

const DUE_CONTEXT: Record<string, string> = {
  vencida: "Requiere aplicar la próxima desparasitación.",
  entrega_hoy: "Corresponde aplicar la desparasitación hoy.",
  programada: "Siguiente desparasitación programada.",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
      <span className="block text-xs font-extrabold uppercase text-gray-400">{label}</span>
      <span className="mt-1 block font-bold text-gray-900 dark:text-white">
        {value ?? "Sin registro"}
      </span>
    </div>
  );
}

export function DewormingSection({ petName, viewModel }: DewormingSectionProps) {
  return (
    <GlassCard className="h-full overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-600 ring-1 ring-teal-100 dark:bg-teal-500/15 dark:text-teal-400 dark:ring-teal-800">
            <Bug size={20} />
          </span>
          Desparasitación
          {viewModel.total > 0 ? (
            <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-extrabold text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-800">
              {viewModel.total}
            </span>
          ) : null}
        </h2>
      </div>

      {viewModel.nextDue ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl ring-1 p-4">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-extrabold ring-1",
              viewModel.nextDue.tone,
            ].join(" ")}
          >
            <CalendarDays size={15} aria-hidden="true" />
            {viewModel.nextDue.label}
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-950 dark:text-white">
              {viewModel.nextDue.fecha}
            </p>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {DUE_CONTEXT[viewModel.nextDue.kind]}
            </p>
          </div>
        </div>
      ) : null}

      {viewModel.items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {viewModel.items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/80"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-100 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-800">
                  <Package size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-extrabold text-gray-950 dark:text-white">
                    {item.producto}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Aplicada el {item.fecha ?? "fecha no registrada"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Fecha" value={item.fecha} />
                <Field label="Próxima fecha" value={item.proximaFecha} />
                <Field label="Dosis" value={item.dosis} />
                <Field label="Veterinario" value={item.veterinario} />
              </div>

              {item.documentoUrl ? (
                <div className="mt-4 flex justify-end">
                  <a
                    href={item.documentoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-extrabold text-teal-700 ring-1 ring-teal-100 transition hover:bg-teal-100 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-800 dark:hover:bg-teal-500/25"
                  >
                    <FileText size={16} />
                    Ver documento
                  </a>
                </div>
              ) : null}

              {item.missingFields.length > 0 ? (
                <p className="mt-3 text-sm font-bold text-amber-700 dark:text-amber-300">
                  Datos faltantes: {item.missingFields.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800">
            <Bug size={28} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-gray-950 dark:text-white">
            Sin desparasitaciones registradas
          </p>
          <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
            Aún no hay registros de desparasitación para {petName}.
          </p>
        </div>
      )}

      <p className="mt-5 text-sm font-semibold text-gray-500 dark:text-gray-400">
        La próxima fecha es informativa: el calendario real lo define tu veterinario.
      </p>
    </GlassCard>
  );
}