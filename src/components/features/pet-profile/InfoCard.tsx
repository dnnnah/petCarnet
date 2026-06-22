import { Info, PawPrint } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type InfoCardProps = {
  petName: string;
  info: {
    species: string;
    breed: string;
    color: string;
    weight: string;
    birthDate: string;
    distinctive: ReadonlyArray<string>;
  };
};

export function InfoCard({ petName, info }: InfoCardProps) {
  const rows = [
    ["Especie:", info.species],
    ["Raza:", info.breed],
    ["Color:", info.color],
    ["Peso:", info.weight],
    ["Fecha de nacimiento:", info.birthDate],
  ];

  return (
    <GlassCard className="relative h-full overflow-hidden p-6 lg:p-7">
      <div className="absolute bottom-5 right-5 text-amber-100">
        <PawPrint size={42} fill="currentColor" />
      </div>
      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-500 ring-1 ring-blue-100">
          <Info size={21} />
        </span>
        Información de {petName}
      </h2>

      <div className="relative mt-7 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[22px_1fr] gap-3">
            <PawPrint className="mt-1 text-gray-700" size={16} />
            <p className="leading-6 text-gray-900">
              <span className="font-extrabold">{label}</span>{" "}
              <span className="font-semibold">{value}</span>
            </p>
          </div>
        ))}
        <div className="grid grid-cols-[22px_1fr] gap-3">
          <PawPrint className="mt-1 text-gray-700" size={16} />
          <div>
            <p className="font-extrabold text-gray-900">Rasgos distintivos:</p>
            {info.distinctive.map((item) => (
              <p key={item} className="mt-1 font-semibold leading-6 text-gray-700">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
