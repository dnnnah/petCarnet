import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { LostPetAlertForm } from "@/components/features/lost-pet/LostPetAlertForm";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import { getPetOrNotFound } from "@/lib/getPetOrNotFound";

type AlertPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllPets().map((pet) => ({ id: pet.id }));
}

export async function generateMetadata({ params }: AlertPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    return {
      title: "Alerta no encontrada | PetCarnet",
    };
  }

  return {
    title: `Generar alerta de ${pet.mascota.nombre} | PetCarnet`,
    description: `Genera una imagen de alerta para compartir cuando ${pet.mascota.nombre} está perdido.`,
  };
}

export default async function AlertPage({ params }: AlertPageProps) {
  const { id } = await params;
  const pet = getPetOrNotFound(id);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100"
          >
            <ArrowLeft size={18} />
            Volver al perfil
          </Link>

          <SubpageHeader
            eyebrow="Generar alerta"
            eyebrowTone="text-rose-600"
            title={`Alerta de ${pet.mascota.nombre}`}
            description="Genera una imagen para compartir en redes sociales y mensajería cuando tu mascota esté perdida."
            icon={<AlertTriangle size={96} />}
            background="bg-gradient-to-r from-rose-50 via-white to-amber-50 ring-rose-100"
          />

          <LostPetAlertForm pet={pet} />
        </div>
      </div>
    </AppShell>
  );
}
