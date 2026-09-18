import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HeartCrack } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { LostPetAlertForm } from "@/components/features/lost-pet/LostPetAlertForm";
import { isTerminalPetStatus } from "@/lib/domain/petStatus";
import { getPetByIdAny, getAllProfilePets } from "@/lib/getPetByIdAny";
import { notFound } from "next/navigation";

type AlertPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllProfilePets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: AlertPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    return {
      title: "Alerta no encontrada | PetCarnet",
    };
  }

  const isTerminal = isTerminalPetStatus(pet.estado);

  return {
    title: isTerminal
      ? `En memoria de ${pet.mascota.nombre} | PetCarnet`
      : `Generar alerta de ${pet.mascota.nombre} | PetCarnet`,
    description: isTerminal
      ? `El perfil de ${pet.mascota.nombre} se conserva como recuerdo en PetCarnet.`
      : `Genera una imagen de alerta para compartir cuando ${pet.mascota.nombre} está perdido.`,
  };
}

export default async function AlertPage({ params }: AlertPageProps) {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const isTerminal = isTerminalPetStatus(pet.estado);

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
            eyebrow={isTerminal ? "Estado terminal" : "Generar alerta"}
            eyebrowTone={isTerminal ? "text-stone-600" : "text-rose-600"}
            title={isTerminal ? `En memoria de ${pet.mascota.nombre}` : `Alerta de ${pet.mascota.nombre}`}
            description={isTerminal
              ? "El estado actual de este perfil no admite la generación de alertas de mascota perdida."
              : "Genera una imagen para compartir en redes sociales y mensajería cuando tu mascota esté perdida."}
            icon={<HeartCrack size={96} />}
            background={isTerminal
              ? "bg-gradient-to-r from-stone-50 via-white to-gray-100 ring-stone-100"
              : "bg-gradient-to-r from-rose-50 via-white to-amber-50 ring-rose-100"}
          />

          {!isTerminal ? <LostPetAlertForm pet={pet} /> : null}
        </div>
      </div>
    </AppShell>
  );
}
