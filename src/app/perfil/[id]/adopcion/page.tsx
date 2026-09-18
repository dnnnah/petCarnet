import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, HeartCrack, HeartHandshake } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { AdoptionRequestForm } from "@/components/features/adoption/AdoptionRequestForm";
import { resolveAdoptionAvailability } from "@/lib/domain/adoption";
import { isTerminalPetStatus } from "@/lib/domain/petStatus";
import { findShelterForPet } from "@/lib/domain/shelter";
import { getPetStatusMeta } from "@/lib/mapping/petStatusPresentation";
import { getPetByIdAny } from "@/lib/getPetByIdAny";
import { getAdoptionDemoPets } from "@/lib/getAdoptionDemoPets";
import { getMockShelters } from "@/lib/getMockShelters";

type AdoptionPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAdoptionDemoPets().flatMap((pet) => [
    { id: pet.id },
    { id: pet.identificacion.codigoPublico },
  ]);
}

export async function generateMetadata({ params }: AdoptionPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    return {
      title: "Solicitud no encontrada | PetCarnet",
      robots: { index: false },
    };
  }

  return {
    title: `Solicitar adopción de ${pet.mascota.nombre} | PetCarnet`,
    description: `Solicitud de adopción prototipo para ${pet.mascota.nombre} (${pet.mascota.especie}) en PetCarnet.`,
  };
}

export default async function AdoptionRequestPage({ params }: AdoptionPageProps) {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const shelter = findShelterForPet(pet.id, getMockShelters());
  const availability = resolveAdoptionAvailability({
    estado: pet.estado,
    emergencia: pet.emergencia,
    alert: null,
  });
  const isTerminal = isTerminalPetStatus(pet.estado);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Volver al perfil de {pet.mascota.nombre}
          </Link>

          <SubpageHeader
            eyebrow="Solicitud de adopción"
            eyebrowTone="text-violet-600"
            title={`Adoptar a ${pet.mascota.nombre}`}
            description="Completa el formulario para registrar tu interés. En este prototipo la solicitud se guarda solo en este navegador y no se envía a ningún servidor."
            icon={<HeartHandshake size={96} />}
            background="bg-gradient-to-r from-violet-50 via-white to-indigo-50 ring-violet-100"
          />

          {!availability.available ? (
            <GlassCard className="p-6 lg:p-8">
              <div className="text-center">
                <span
                  className={[
                    "mx-auto grid h-16 w-16 place-items-center rounded-full",
                    isTerminal
                      ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
                  ].join(" ")}
                >
                  {isTerminal ? <HeartCrack size={32} aria-hidden="true" /> : <Ban size={32} aria-hidden="true" />}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold text-gray-950 dark:text-white">
                  No es posible solicitar la adopción
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-gray-600 dark:text-gray-300">
                  El estado actual de {pet.mascota.nombre} es{" "}
                  <strong>{getPetStatusMeta(availability.effectiveStatus).label}</strong>, por lo que
                  no está disponible para adopción en este momento.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/perfil/${pet.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Volver al perfil
                  </Link>
                </div>
              </div>
            </GlassCard>
          ) : (
            <AdoptionRequestForm pet={pet} shelterName={shelter?.nombre ?? null} />
          )}
        </div>
      </div>
    </AppShell>
  );
}