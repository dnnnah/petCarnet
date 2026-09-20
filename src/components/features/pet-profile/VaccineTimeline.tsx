import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { VaccineItemViewModel } from "@/lib/mapping/health";

type VaccineTimelineProps = {
  petId: string;
  petName: string;
  totalCount: number;
  vaccines: ReadonlyArray<VaccineItemViewModel>;
};

type VaccineVisual = {
  icon: typeof Check;
  circleTone: string;
  chipTone: string;
};

function visualFor(vaccine: VaccineItemViewModel): VaccineVisual {
  if (vaccine.alert?.kind === "vencida") {
    return {
      icon: AlertTriangle,
      circleTone:
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      chipTone:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-200",
    };
  }
  if (vaccine.alert) {
    return {
      icon: Clock,
      circleTone:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      chipTone:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-200",
    };
  }
  return {
    icon: Check,
    circleTone:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    chipTone:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-200",
  };
}

export function VaccineTimeline({ petId, petName, totalCount, vaccines }: VaccineTimelineProps) {
  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 ring-1 ring-emerald-100">
            <ShieldCheck size={22} />
          </span>
          Registro de Vacunas
          {totalCount > 0 ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-200">
              {totalCount}
            </span>
          ) : null}
        </h2>
        <Link href={`/perfil/${petId}/vacunas`} className="flex items-center gap-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          Ver cartilla completa
          <ChevronRight size={18} />
        </Link>
      </div>

      {vaccines.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {vaccines.map((vaccine) => {
            const visual = visualFor(vaccine);
            const Icon = visual.icon;
            return (
              <article key={vaccine.id} className="flex items-center gap-4">
                <span
                  className={[
                    "relative z-10 grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-full shadow-[0_12px_26px_rgba(17,24,39,0.13)] ring-4 ring-white dark:ring-background",
                    visual.circleTone,
                  ].join(" ")}
                >
                  <Icon size={26} strokeWidth={2.6} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base sm:text-lg font-extrabold text-gray-950 dark:text-white">{vaccine.name}</span>
                  <span className="mt-1 block text-sm font-bold text-gray-700 dark:text-gray-200">
                    {vaccine.applicationDate ?? "Fecha no registrada"}
                  </span>
                  <span
                    className={[
                      "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 dark:ring-0",
                      visual.chipTone,
                    ].join(" ")}
                  >
                    {vaccine.alert ? vaccine.alert.label : "Al día"}
                  </span>
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-7 rounded-3xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800">
            <ShieldCheck size={30} />
          </span>
          <p className="mt-4 text-xl font-extrabold text-gray-950 dark:text-white">Sin vacunas registradas</p>
          <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
            Aún no se han registrado vacunas para {petName}.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
