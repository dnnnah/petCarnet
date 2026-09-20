import { FileText, HeartPulse, Stethoscope, TestTube } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { MedicalHistoryViewModel } from "@/lib/mapping/health";

type MedicalHistorySectionProps = {
  petName: string;
  viewModel: MedicalHistoryViewModel;
};

function SummaryChip({ label, count }: { label: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-extrabold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-800">
      {count} {label}
    </span>
  );
}

export function MedicalHistorySection({ petName, viewModel }: MedicalHistorySectionProps) {
  const summary = viewModel.summary;

  return (
    <GlassCard className="h-full overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-400 dark:ring-sky-800">
            <Stethoscope size={20} />
          </span>
          Historial médico
          {viewModel.total > 0 ? (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-extrabold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-800">
              {viewModel.total}
            </span>
          ) : null}
        </h2>
      </div>

      {viewModel.total > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <SummaryChip label="consultas" count={summary.total} />
          <SummaryChip label="con diagnóstico" count={summary.conDiagnostico} />
          <SummaryChip label="con tratamiento" count={summary.conTratamiento} />
          <SummaryChip label="con medicamentos" count={summary.conMedicamentos} />
          {summary.sinVeterinario > 0 ? (
            <SummaryChip label="sin veterinario" count={summary.sinVeterinario} />
          ) : null}
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
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-800">
                  <HeartPulse size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-extrabold text-gray-950 dark:text-white">
                    {item.motivo}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {item.fecha ?? "Fecha no registrada"}
                  </p>
                </div>
              </div>

              {item.diagnostico ? (
                <p className="mt-4 rounded-xl bg-sky-50 px-4 py-3 font-bold text-gray-800 ring-1 ring-sky-100 dark:bg-sky-500/10 dark:text-gray-100 dark:ring-sky-800">
                  Diagnóstico: {item.diagnostico}
                </p>
              ) : null}

              <div className="mt-4 space-y-3">
                {item.tratamiento ? (
                  <p className="font-semibold text-gray-700 dark:text-gray-200">
                    Tratamiento: {item.tratamiento}
                  </p>
                ) : null}
                {item.medicamentos.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <TestTube size={16} className="text-violet-500" aria-hidden="true" />
                    {item.medicamentos.map((medication) => (
                      <span
                        key={medication}
                        className="rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-800"
                      >
                        {medication}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.veterinario ? (
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Atendió: {item.veterinario}
                  </p>
                ) : null}
              </div>

              {item.documentos.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.documentos.map((document) => (
                    <li key={document.id}>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-800 dark:hover:bg-sky-500/25"
                      >
                        <FileText size={16} />
                        {document.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
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
            <Stethoscope size={28} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-gray-950 dark:text-white">
            Sin historial médico
          </p>
          <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
            Aún no hay consultas registradas para {petName}.
          </p>
        </div>
      )}
    </GlassCard>
  );
}