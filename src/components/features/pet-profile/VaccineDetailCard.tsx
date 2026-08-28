import { FileText, Syringe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatMexicanDate } from "@/lib/dateFormat";
import { getVaccineStatusMeta } from "@/lib/domain/vaccineStatus";
import type { PetVaccine } from "@/types/pet";

type VaccineDetailCardProps = {
  vaccine: PetVaccine;
};

export function VaccineDetailCard({ vaccine }: VaccineDetailCardProps) {
  const status = getVaccineStatusMeta(vaccine.estatus);
  const StatusIcon = status.icon;
  const appliedDate = formatMexicanDate(vaccine.fechaAplicacion);
  const nextDose = formatMexicanDate(vaccine.proximaDosis);

  return (
    <GlassCard className="p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <span
          className={[
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1",
            status.iconTones,
          ].join(" ")}
        >
          <Syringe size={26} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold leading-6 text-gray-950">
              {vaccine.nombre}
            </h3>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                status.tones,
              ].join(" ")}
            >
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white/80 p-3">
              <span className="block text-xs font-extrabold uppercase text-gray-400">
                Fecha de aplicación
              </span>
              <span className="mt-1 block font-bold text-gray-900">
                {appliedDate ?? "Sin registro"}
              </span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/80 p-3">
              <span className="block text-xs font-extrabold uppercase text-gray-400">
                Próxima dosis
              </span>
              <span className="mt-1 block font-bold text-gray-900">
                {nextDose ?? "Sin registro"}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white/80 p-3">
              <span className="block text-xs font-extrabold uppercase text-gray-400">
                Lote
              </span>
              <span className="mt-1 block font-bold text-gray-900">
                {vaccine.lote || "Sin registro"}
              </span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/80 p-3">
              <span className="block text-xs font-extrabold uppercase text-gray-400">
                Veterinario
              </span>
              <span className="mt-1 block font-bold text-gray-900">
                {vaccine.veterinario || "Sin registro"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {vaccine.documentoUrl ? (
        <div className="mt-4 flex justify-end">
          <a
            href={vaccine.documentoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            <FileText size={16} />
            Ver documento
          </a>
        </div>
      ) : null}
    </GlassCard>
  );
}
