import { Check, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type VaccineTimelineProps = {
  vaccines: ReadonlyArray<{
    name: string;
    date: string;
    status: "Al día" | "Próxima dosis";
  }>;
};

export function VaccineTimeline({ vaccines }: VaccineTimelineProps) {
  return (
    <GlassCard className="overflow-hidden p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <ShieldCheck size={22} />
          </span>
          Registro de Vacunas
        </h2>
        <a href="#" className="flex items-center gap-2 text-sm font-extrabold text-emerald-600">
          Ver cartilla completa
          <ChevronRight size={18} />
        </a>
      </div>

      <div className="relative mt-7 overflow-x-auto pb-2">
        <div className="absolute left-14 right-14 top-[34px] hidden border-t-2 border-dashed border-gray-200 md:block" />
        <div className="relative grid min-w-[720px] grid-cols-3 gap-8">
          {vaccines.map((vaccine) => {
            const next = vaccine.status === "Próxima dosis";
            return (
              <article key={vaccine.name} className="grid grid-cols-[76px_1fr] items-center gap-4">
                <span
                  className={[
                    "relative z-10 grid h-16 w-16 place-items-center rounded-full shadow-[0_12px_26px_rgba(17,24,39,0.13)] ring-4 ring-white",
                    next
                      ? "bg-amber-200 text-amber-700"
                      : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}
                >
                  {next ? (
                    <Clock size={30} strokeWidth={2.6} />
                  ) : (
                    <Check size={36} strokeWidth={3.2} />
                  )}
                </span>
                <span>
                  <span className="block text-lg font-extrabold text-gray-950">{vaccine.name}</span>
                  <span className="mt-1 block text-sm font-bold text-gray-700">{vaccine.date}</span>
                  <span
                    className={[
                      "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                      next
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    ].join(" ")}
                  >
                    {vaccine.status}
                  </span>
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
