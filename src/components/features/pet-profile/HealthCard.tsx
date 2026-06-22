import { ChevronDown, Heart, PawPrint } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type HealthCardProps = {
  health: {
    allergies: ReadonlyArray<string>;
    conditions: ReadonlyArray<string>;
    behavior: string;
  };
};

export function HealthCard({ health }: HealthCardProps) {
  return (
    <GlassCard className="relative h-full overflow-hidden p-6 lg:p-7">
      <div className="absolute right-9 top-24 text-amber-100">
        <PawPrint size={34} fill="currentColor" />
      </div>
      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-pink-500 ring-1 ring-pink-100">
          <Heart size={21} />
        </span>
        Salud Importante
      </h2>

      <div className="relative mt-7 space-y-5">
        <div>
          <span className="inline-flex rounded-full bg-pink-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 ring-1 ring-pink-200/70">
            Alergias
          </span>
          <ul className="mt-3 list-disc space-y-1 pl-6 font-semibold text-gray-800">
            {health.allergies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-amber-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 ring-1 ring-amber-200/70">
            Condiciones
          </span>
          <ul className="mt-3 list-disc space-y-1 pl-6 font-semibold text-gray-800">
            {health.conditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-blue-100/72 px-5 py-1.5 text-sm font-extrabold text-gray-800 ring-1 ring-blue-200/70">
            Comportamiento
          </span>
          <p className="mt-3 font-semibold leading-7 text-gray-800">{health.behavior}</p>
        </div>

        <button className="mx-auto flex items-center gap-2 text-sm font-extrabold text-emerald-600">
          Ver más detalles
          <ChevronDown size={18} />
        </button>
      </div>
    </GlassCard>
  );
}
