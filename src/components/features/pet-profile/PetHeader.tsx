import Image from "next/image";
import {
  CalendarDays,
  Copy,
  Heart,
  Mars,
  Microchip,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sparkles,
  Venus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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
};

export function PetHeader({ pet }: PetHeaderProps) {
  return (
    <section className="soft-card relative overflow-hidden rounded-[2.25rem] px-5 py-7 sm:px-8 lg:px-14 lg:py-9">
      <div className="pointer-events-none absolute left-16 top-8 h-44 w-44 rounded-full bg-emerald-100/58" />
      <div className="pointer-events-none absolute left-10 bottom-8 h-28 w-28 rounded-full bg-amber-100/54" />
      <div className="pointer-events-none absolute right-16 top-20 text-gray-100">
        <PawPrint size={54} fill="currentColor" />
      </div>
      <div className="pointer-events-none absolute right-10 bottom-22 text-emerald-300/80">
        <Sparkles size={46} />
      </div>
      <div className="pointer-events-none absolute right-36 bottom-10 h-16 w-28 -rotate-12 doodle-line" />

      <div className="relative grid items-center gap-9 lg:grid-cols-[310px_1fr] xl:grid-cols-[350px_1fr]">
        <div className="relative mx-auto w-full max-w-[300px] xl:max-w-[330px]">
          <div className="absolute -right-5 bottom-8 z-20 grid h-20 w-20 place-items-center rounded-full bg-white text-emerald-500 shadow-[0_14px_28px_rgba(17,24,39,0.11)] ring-8 ring-emerald-50">
            <PawPrint size={35} />
          </div>
          <div className="absolute -right-2 top-2 z-20 rotate-12 text-emerald-300">
            <Sparkles size={26} />
          </div>
          <div className="relative z-10 rotate-[-3deg] rounded-[2rem] bg-white p-4 shadow-[0_22px_54px_rgba(17,24,39,0.12)]">
            <div className="overflow-hidden rounded-[1.45rem] bg-emerald-50">
              <Image
                src={pet.image}
                alt={`Foto de ${pet.name}`}
                width={900}
                height={900}
                priority
                className="aspect-[0.86] w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-2 top-2 hidden rotate-12 text-amber-300 sm:block">
            <Sparkles size={34} />
          </div>

          <h1 className="text-5xl font-extrabold leading-none tracking-tight text-gray-950 sm:text-6xl lg:text-8xl">
            {pet.name}
          </h1>
          <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-emerald-600">{pet.breed} · {pet.species}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Badge tone="mint" icon={<CalendarDays size={18} />}>
              {pet.age}
            </Badge>
            <Badge tone={pet.gender === "Macho" ? "blue" : "pink"} icon={pet.gender === "Macho" ? <Mars size={18} /> : <Venus size={18} />}>
              {pet.gender}
            </Badge>
            <Badge tone="blue" icon={<Ruler size={18} />}>
              {pet.size}
            </Badge>
          </div>

          <div className="mt-7 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
            <span className="font-extrabold text-gray-950">ID PetCarnet: {pet.id}</span>
            <Copy size={20} className="shrink-0 text-gray-700" />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <article className="rounded-3xl border border-gray-100 bg-white/92 p-4 shadow-[0_12px_26px_rgba(17,24,39,0.06)]">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                <ShieldCheck size={27} />
              </span>
              <p className="font-extrabold text-gray-950">Vacunas</p>
              <p className="text-sm font-bold text-gray-600">{pet.status.vaccines}</p>
            </article>
            <article className="rounded-3xl border border-gray-100 bg-white/92 p-4 shadow-[0_12px_26px_rgba(17,24,39,0.06)]">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-pink-100 text-pink-500">
                <Heart size={27} />
              </span>
              <p className="font-extrabold text-gray-950">Esterilizado</p>
              <p className="text-sm font-bold text-gray-600">{pet.status.sterilized}</p>
            </article>
            <article className="rounded-3xl border border-gray-100 bg-white/92 p-4 shadow-[0_12px_26px_rgba(17,24,39,0.06)]">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                <Microchip size={27} />
              </span>
              <p className="font-extrabold text-gray-950">Microchip</p>
              <p className="text-sm font-bold text-gray-600">{pet.status.microchip}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
