import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { VaccineDetailCard } from "@/components/features/pet-profile/VaccineDetailCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";

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
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

  const vaccines = pet.vacunas;
  const alDia = vaccines.filter((v) => v.estatus === "al_dia").length;
  const proximas = vaccines.filter((v) => v.estatus === "proxima_dosis").length;
  const vencidas = vaccines.filter((v) => v.estatus === "vencida").length;

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

          <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-[0_16px_38px_rgba(16,185,129,0.09)] ring-1 ring-emerald-100 sm:p-8">
            <div className="absolute -right-4 -top-6 text-emerald-100">
              <ShieldCheck size={96} />
            </div>
            <div className="relative">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-600">
                Cartilla de vacunación
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                Vacunas de {pet.mascota.nombre}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-gray-600">
                Registro completo del esquema de vacunación.
              </p>
            </div>

            {vaccines.length > 0 ? (
              <div className="relative mt-6 flex flex-wrap gap-3">
                {alDia > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                    {alDia} al día
                  </span>
                ) : null}
                {proximas > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-700 ring-1 ring-amber-200">
                    {proximas} próxima dosis
                  </span>
                ) : null}
                {vencidas > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200">
                    {vencidas} vencidas
                  </span>
                ) : null}
              </div>
            ) : null}
          </section>

          {vaccines.length > 0 ? (
            <div className="space-y-4">
              {vaccines.map((vaccine) => (
                <VaccineDetailCard key={vaccine.id} vaccine={vaccine} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100">
                <ShieldCheck size={32} />
              </div>
              <p className="mt-5 text-2xl font-extrabold text-gray-950">
                Sin vacunas registradas
              </p>
              <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600">
                Aún no se han registrado vacunas para {pet.mascota.nombre}.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
