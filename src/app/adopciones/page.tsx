import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HeartHandshake, PawPrint } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { AdoptionCatalog, type ShelterFilterOption } from "@/components/features/adoption/AdoptionCatalog";
import { PrototypeNotice } from "@/components/features/adoption/PrototypeNotice";
import { filterAdoptablePets, buildAdoptionCatalogEntry } from "@/lib/domain/adoption";
import { findShelterForPet } from "@/lib/domain/shelter";
import { buildCatalogCard } from "@/lib/mapping/adoptionPresentation";
import { getAdoptionDemoPets } from "@/lib/getAdoptionDemoPets";
import { getMockShelters } from "@/lib/getMockShelters";

export const metadata: Metadata = {
  title: "Adopciones | PetCarnet",
  description:
    "Encuentra mascotas en adopción a través del prototipo de PetCarnet: conoce sus perfiles y envía una solicitud de demostración.",
};

export default function AdopcionesPage() {
  const pets = getAdoptionDemoPets();
  const shelters = getMockShelters();
  const adoptablePets = filterAdoptablePets(pets);
  const entries = adoptablePets.map((pet) =>
    buildAdoptionCatalogEntry(pet, findShelterForPet(pet.id, shelters)),
  );
  const cards = entries.map(buildCatalogCard);

  const shelterOptions: ShelterFilterOption[] = [];
  for (const card of cards) {
    const key = card.shelterId ?? "__ninguno";
    const label = card.shelterId && card.shelterName ? card.shelterName : "Sin refugio";
    if (!shelterOptions.some((option) => option.id === key)) {
      shelterOptions.push({ id: key, label });
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-7">
          <SubpageHeader
            eyebrow="Adopción"
            eyebrowTone="text-violet-600"
            title="Mascotas en adopción"
            description="Perfiles de mascotas que buscan un hogar. Esta vista es parte del prototipo de PetCarnet y usa datos simulados para demostrar el flujo de adopción."
            icon={<HeartHandshake size={96} />}
            background="bg-gradient-to-r from-violet-50 via-white to-indigo-50 ring-violet-100"
          />

          <PrototypeNotice />

          <AdoptionCatalog cards={cards} shelters={shelterOptions} />

          <section aria-labelledby="refugios-titulo">
            <h2 id="refugios-titulo" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              <Building2 size={26} className="text-violet-500" aria-hidden="true" />
              Refugios participantes
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shelters.map((shelter) => (
                <Link
                  key={shelter.id}
                  href={`/refugios/${shelter.id}`}
                  className="group flex items-center gap-4 rounded-[1.6rem] bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.07)] ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(124,58,237,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:ring-gray-800"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                    <PawPrint size={24} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-extrabold text-gray-950 dark:text-white">
                      {shelter.nombre}
                    </span>
                    <span className="block text-sm font-bold text-gray-500 dark:text-gray-400">
                      {shelter.ubicacion}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}