import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { getVaccineSummary } from "@/lib/mapping/vaccines";
import { VaccineDetailCard } from "@/components/features/pet-profile/VaccineDetailCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import { getPetOrNotFound } from "@/lib/getPetOrNotFound";

type VaccinesPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllPets().map((pet) => ({ id: pet.id }));
}

export async function generateMetadata({ params }: VaccinesPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    return {
      title: "Vacunas no encontradas | PetCarnet",
    };
  }

  return {
    title: `Vacunas de ${pet.mascota.nombre} | PetCarnet`,
    description: `Cartilla de vacunación de ${pet.mascota.nombre}.`,
  };
}

export default async function VaccinesPage({ params }: VaccinesPageProps) {
  const { id } = await params;
  const pet = getPetOrNotFound(id);

  const vaccines = pet.vacunas;
  const { total, alDia, proximas, vencidas } = getVaccineSummary(pet);

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
            eyebrow="Cartilla de vacunación"
            eyebrowTone="text-emerald-600"
            title={`Vacunas de ${pet.mascota.nombre}`}
            description="Registro completo del esquema de vacunación."
            icon={<ShieldCheck size={96} />}
            background="bg-gradient-to-r from-emerald-50 via-white to-amber-50 ring-emerald-100"
          />

          {total > 0 ? (
            <div className="flex flex-wrap gap-3">
              {alDia > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
                  {alDia} al día
                </span>
              ) : null}
              {proximas > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-800">
                  {proximas} próxima dosis
                </span>
              ) : null}
              {vencidas > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-800">
                  {vencidas} vencidas
                </span>
              ) : null}
            </div>
          ) : null}

          {vaccines.length > 0 ? (
            <div className="space-y-4">
              {vaccines.map((vaccine) => (
                <VaccineDetailCard key={vaccine.id} vaccine={vaccine} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
                <ShieldCheck size={32} />
              </div>
              <p className="mt-5 text-2xl font-extrabold text-gray-950 dark:text-white">
                Sin vacunas registradas
              </p>
              <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
                Aún no se han registrado vacunas para {pet.mascota.nombre}.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
