import Link from "next/link";
import { Check, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type VaccineTimelineProps = {
  petId: string;
  totalCount: number;
  vaccines: ReadonlyArray<{
    name: string;
    date: string;
    status: "Al día" | "Próxima dosis";
  }>;
};

export function VaccineTimeline({ petId, totalCount, vaccines }: VaccineTimelineProps) {
  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <ShieldCheck size={22} />
          </span>
          Registro de Vacunas
          {totalCount > 0 ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              {totalCount}
            </span>
          ) : null}
        </h2>
        <Link href={`/perfil/${petId}/vacunas`} className="flex items-center gap-2 text-sm font-extrabold text-emerald-600">
          Ver cartilla completa
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {vaccines.map((vaccine) => {
          const next = vaccine.status === "Próxima dosis";
          return (
            <article key={vaccine.name} className="flex items-center gap-4">
              <span
                className={[
                  "relative z-10 grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-full shadow-[0_12px_26px_rgba(17,24,39,0.13)] ring-4 ring-white",
                  next
                    ? "bg-amber-200 text-amber-700"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                {next ? (
                  <Clock size={28} strokeWidth={2.6} />
                ) : (
                  <Check size={32} strokeWidth={3.2} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-base sm:text-lg font-extrabold text-gray-950">{vaccine.name}</span>
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
    </GlassCard>
  );
}
