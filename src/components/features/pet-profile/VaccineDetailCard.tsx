import { FileText, Syringe, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { VaccineItemViewModel } from "@/lib/mapping/health";

type VaccineDetailCardProps = {
  vaccine: VaccineItemViewModel;
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

export function VaccineDetailCard({ vaccine }: VaccineDetailCardProps) {
  return (
    <GlassCard className="p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <span
          className={[
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1",
            vaccine.statusTones,
          ].join(" ")}
        >
          <Syringe size={26} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold leading-6 text-gray-950 dark:text-white">
              {vaccine.name}
            </h3>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                vaccine.statusTones,
              ].join(" ")}
            >
              {vaccine.status ?? "Sin estado registrado"}
            </span>
          </div>

          {vaccine.alert ? (
            <span
              className={[
                "mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold ring-1",
                vaccine.alert.tone,
              ].join(" ")}
            >
              <TriangleAlert size={14} aria-hidden="true" />
              {vaccine.alert.label}
            </span>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Fecha de aplicación" value={vaccine.applicationDate} />
            <Field label="Próxima dosis" value={vaccine.nextDoseDate} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Lote" value={vaccine.lote} />
            <Field label="Veterinario" value={vaccine.veterinario} />
          </div>

          {vaccine.origen || vaccine.fechaCreacion ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Origen del registro" value={vaccine.origen} />
              <Field label="Fecha de registro" value={vaccine.fechaCreacion} />
            </div>
          ) : null}

          {vaccine.missingFields.length > 0 ? (
            <p className="mt-3 text-sm font-bold text-amber-700 dark:text-amber-300">
              Datos faltantes: {vaccine.missingFields.join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {vaccine.document ? (
        <div className="mt-4 flex justify-end">
          <a
            href={vaccine.document.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-800 dark:hover:bg-emerald-500/25"
          >
            <FileText size={16} />
            {vaccine.document.nombre}
          </a>
        </div>
      ) : null}
    </GlassCard>
  );
}
