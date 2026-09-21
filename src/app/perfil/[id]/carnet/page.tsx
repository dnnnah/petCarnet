import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, IdCard } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CarnetStudio } from "@/components/features/carnet/CarnetStudio";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { buildPhysicalPetCard } from "@/lib/domain/carnet";
import { getPetByIdAny, getAllProfilePets } from "@/lib/getPetByIdAny";
import type { PhysicalPetCardFormato } from "@/types/carnet";
import { notFound } from "next/navigation";

type CarnetPageProps = {
  params: Promise<{ id: string }>;
};

const FORMATOS: PhysicalPetCardFormato[] = ["tarjeta_imprimible", "credencial", "placa_dije"];

export function generateStaticParams() {
  return getAllProfilePets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: CarnetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    return {
      title: "Carnet no encontrado | PetCarnet",
    };
  }

  return {
    title: `Carnet físico de ${pet.mascota.nombre} | PetCarnet`,
    description: `Carnet físico de ${pet.mascota.nombre}: identidad, perfil público, contacto y salud para imprimir.`,
  };
}

export default async function CarnetPage({ params }: CarnetPageProps) {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const cards = Object.fromEntries(
    FORMATOS.map((formato) => [formato, buildPhysicalPetCard(pet, { formato })]),
  ) as Record<PhysicalPetCardFormato, ReturnType<typeof buildPhysicalPetCard>>;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
          >
            <ArrowLeft size={18} />
            Volver al perfil
          </Link>

          <SubpageHeader
            eyebrow="Carnet físico · Kit con Causa"
            eyebrowTone="text-emerald-600"
            title={`Carnet de ${pet.mascota.nombre}`}
            description="La identidad física de la mascota: identificación, QR con su perfil público, contacto y salud. Cambia entre formatos para imprimir."
            icon={<IdCard size={96} />}
            background="bg-gradient-to-r from-emerald-50 via-white to-sky-50 ring-emerald-100"
          />

          <CarnetStudio petName={pet.mascota.nombre} cards={cards} />

          <p className="text-center text-sm font-bold text-gray-400 dark:text-gray-500">
            Los tres formatos se derivan del mismo modelo de core y respetan el QR mínimo de impresión.
          </p>
        </div>
      </div>
    </AppShell>
  );
}