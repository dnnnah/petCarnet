import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LostPetAlertForm } from "@/components/features/pet-profile/LostPetAlertForm";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";

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
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

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

          <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-rose-50 via-white to-amber-50 p-6 shadow-[0_16px_38px_rgba(225,29,72,0.09)] ring-1 ring-rose-100 sm:p-8">
            <div className="absolute -right-4 -top-6 text-rose-100">
              <AlertTriangle size={96} />
            </div>
            <div className="relative">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-rose-600">
                Generar alerta
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                Alerta de {pet.mascota.nombre}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-gray-600">
                Genera una imagen para compartir en redes sociales y mensajería cuando tu mascota esté perdida.
              </p>
            </div>
          </section>

          <LostPetAlertForm pet={pet} />
        </div>
      </div>
    </AppShell>
  );
}
