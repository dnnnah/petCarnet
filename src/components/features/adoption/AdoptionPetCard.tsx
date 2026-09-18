import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, MapPin, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AdoptionCatalogCard } from "@/lib/mapping/adoptionPresentation";

type AdoptionPetCardProps = {
  card: AdoptionCatalogCard;
};

export function AdoptionPetCard({ card }: AdoptionPetCardProps) {
  return (
    <Link
      href={card.href}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.07)] ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(124,58,237,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:ring-gray-800"
    >
      <div className="relative h-52 overflow-hidden bg-violet-50 dark:bg-gray-800">
        <Image
          src={card.image}
          alt={`Foto de ${card.name}`}
          width={640}
          height={480}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-gray-950/60 to-transparent p-3">
          <Badge tone="purple" icon={<HeartHandshake size={16} aria-hidden="true" />}>
            En adopción
          </Badge>
          {card.verified ? (
            <Badge tone="mint" icon={<ShieldCheck size={16} aria-hidden="true" />}>
              Verificado
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            {card.name}
          </h3>
          <Sparkles size={20} className="shrink-0 text-violet-300" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {card.species} · {card.breed}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge tone="pink">{card.gender}</Badge>
          <Badge tone="blue" icon={<Ruler size={16} aria-hidden="true" />}>
            {card.size}
          </Badge>
          <Badge tone="yellow">{card.age}</Badge>
        </div>

        <div className="mt-auto space-y-1.5 pt-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
            <MapPin size={14} className="shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{card.zone}</span>
          </p>
          {card.shelterName ? (
            <p className="text-xs font-extrabold text-violet-600 dark:text-violet-300">
              Vía {card.shelterName}
            </p>
          ) : (
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Adopción directa</p>
          )}
        </div>
      </div>
    </Link>
  );
}