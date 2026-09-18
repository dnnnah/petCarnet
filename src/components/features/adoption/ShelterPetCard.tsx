import Image from "next/image";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ShelterPetCardPresentation } from "@/lib/mapping/adoptionPresentation";

type ShelterPetCardProps = {
  pet: ShelterPetCardPresentation;
};

export function ShelterPetCard({ pet }: ShelterPetCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-[1.6rem] bg-white p-3 shadow-[0_10px_26px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      <Link href={pet.profileHref} className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-2xl">
        <Image
          src={pet.image}
          alt={`Foto de ${pet.name}`}
          width={128}
          height={128}
          className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            {pet.name}
          </h3>
          <Badge tone={pet.statusTone}>{pet.statusLabel}</Badge>
        </div>
        <p className="mt-0.5 text-sm font-bold text-gray-600 dark:text-gray-300">
          {pet.species} · {pet.breed}
        </p>
        <p className="mt-0.5 text-xs font-bold text-gray-400 dark:text-gray-500">
          ID: {pet.code}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {pet.adoptable ? (
            <Link
              href={pet.adoptionHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <HeartHandshake size={16} aria-hidden="true" />
              Solicitar adopción
            </Link>
          ) : null}
          <Link
            href={pet.profileHref}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </article>
  );
}