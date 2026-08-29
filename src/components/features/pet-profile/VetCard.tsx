import { MapPin, Phone, Plus, Stethoscope } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PetSpeciesIcon } from "@/lib/petIcon";

type VetCardProps = {
  species: string;
  vet: {
    clinic: string;
    doctor: string;
    phone: string;
    address: string;
  };
};

export function VetCard({ vet, species }: VetCardProps) {

  return (
    <GlassCard className="relative h-full overflow-hidden p-6 lg:p-7">
      <Plus className="absolute left-7 top-24 text-blue-100" size={26} />
      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950 dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white ring-1 ring-gray-200">
          <Stethoscope size={22} />
        </span>
        Veterinario
      </h2>

      <div className="mt-8 space-y-5">
        <div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{vet.doctor}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{vet.clinic}</p>
        </div>
        <a href={`tel:${vet.phone}`} className="flex items-center gap-3 font-semibold text-gray-950 dark:text-white">
          <Phone size={20} />
          {vet.phone}
        </a>
        <p className="flex items-center gap-3 font-semibold text-gray-950 dark:text-white">
          <MapPin size={20} />
          {vet.address}
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="flex items-end gap-3 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-amber-50 px-5 py-4 text-gray-900 dark:from-emerald-500/15 dark:to-amber-500/15 dark:text-white ring-1 ring-emerald-100/80">
          <PetSpeciesIcon species={species} className="text-amber-400" size={64} strokeWidth={1.7} />
          <Stethoscope className="mb-2 text-emerald-500" size={54} strokeWidth={1.7} />
        </div>
      </div>
    </GlassCard>
  );
}
