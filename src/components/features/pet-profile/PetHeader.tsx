import Image from "next/image";
import { Heart, Mars, Microchip, Ruler, ShieldCheck, Venus } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataList } from "@/components/ui/DataList";
import { PetMarks } from "@/components/ui/PetMarks";
import { SPECIES_FACE } from "@/lib/ui/speciesFace";

type PetHeaderProps = {
  pet: {
    name: string;
    species: string;
    breed: string;
    age: string;
    gender: string;
    size: string;
    id: string;
    image: string;
    status: {
      vaccines: string;
      sterilized: string;
      microchip: string;
    };
  };
  statusBadge?: React.ReactNode;
};

export function PetHeader({ pet, statusBadge }: PetHeaderProps) {
  const isMale = pet.gender === "Macho";
  const GenderIcon = isMale ? Mars : Venus;
  const SpeciesIcon = SPECIES_FACE[pet.species.trim().toLowerCase()];

  return (
    <section className="relative border-b border-rule pb-8 pt-11 sm:pb-10 sm:pt-0">
      {/* Aparecen en todos los anchos, no solo en escritorio, y por eso la
          seccion reserva una banda arriba por debajo de `sm`. A 320px la foto
          centrada de 240px deja 24px de margen a cada lado: menos que cualquier
          huella legible, asi que la unica banda libre es la de arriba, y tiene
          que medir mas que la marca (38px) para no montarse sobre la foto. A
          partir de 640px el margen llega a 184px y la marca vuelve a la
          esquina, junto al espacio que el titular no usa. */}
      <PetMarks className="right-0 top-0 origin-top-right [scale:0.28] sm:[scale:0.72] lg:[scale:1]" />
      <div className="grid items-start gap-7 sm:gap-9 lg:grid-cols-[240px_1fr]">
        <div className="mx-auto w-full max-w-[240px] lg:mx-0 lg:max-w-none">
          <div className="overflow-hidden rounded-lg bg-sunken ring-1 ring-rule">
            <Image
              src={pet.image}
              alt={`Foto de ${pet.name}`}
              width={900}
              height={900}
              priority
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-[2.5rem] leading-[1.05] text-ink sm:text-6xl">{pet.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-base text-ink-2">
            <span>{pet.breed}</span>
            {SpeciesIcon ? (
              <SpeciesIcon size={15} strokeWidth={1.75} className="text-ink-3" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">·</span>
            )}
            <span>{pet.species}</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {statusBadge}
            <Pill tone="muted">{pet.age}</Pill>
            <Pill tone="muted" icon={<GenderIcon size={13} />}>
              {pet.gender}
            </Pill>
            <Pill tone="muted" icon={<Ruler size={13} />}>
              {pet.size}
            </Pill>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-rule py-2.5">
            <span className="tnum text-sm font-semibold text-ink">ID PetCarnet: {pet.id}</span>
            <CopyButton value={pet.id} label="Copiar ID" />
          </div>

          <DataList
            layout="grid"
            className="mt-5"
            items={[
              { label: "Vacunas", value: pet.status.vaccines, icon: <ShieldCheck size={14} /> },
              { label: "Esterilizado", value: pet.status.sterilized, icon: <Heart size={14} /> },
              { label: "Microchip", value: pet.status.microchip, icon: <Microchip size={14} /> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
