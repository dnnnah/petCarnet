import Link from "next/link";
import { ArrowRight, Heart, PawPrint, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PetsList } from "@/components/features/home/PetsList";
import { getAllPets } from "@/lib/getAllPets";

export default function Home() {
  const pets = getAllPets();
  const featuredPet = pets[0];

  return (
    <AppShell>
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="mint" icon={<ShieldCheck size={16} />}>
              QR publico para emergencias
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl font-extrabold leading-[0.95] text-gray-950 dark:text-white sm:text-6xl lg:text-7xl">
              PetCarnet
            </h1>
            <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Carnet Digital
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Una ficha publica, linda y clara para que cualquier persona pueda
              ayudar a una mascota a volver a casa.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {featuredPet ? (
                <Link
                  href={`/perfil/${featuredPet.id}`}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 text-base font-extrabold text-white shadow-[0_16px_30px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Ver perfil de {featuredPet.mascota.nombre}
                  <ArrowRight size={20} />
                </Link>
              ) : null}
            </div>
          </div>

          <GlassCard id="mascotas" className="relative mx-auto w-full max-w-md p-5 sm:p-6">
            <div className="absolute -left-3 top-8 h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-500/20" />
            <div className="absolute -right-2 bottom-16 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20" />
            <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-100 via-white to-pink-100 p-5 dark:from-emerald-950/40 dark:via-gray-900 dark:to-pink-950/40">
              <div className="rounded-[1.7rem] bg-white/85 p-5 shadow-soft dark:bg-gray-900/85">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <PawPrint size={26} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-400">
                        PetCarnet
                      </p>
                      <p className="text-xl font-extrabold text-gray-950 dark:text-white">
                        Mascotas activas
                      </p>
                    </div>
                  </div>
                  <Heart className="text-pink-300" fill="currentColor" size={26} />
                </div>

                <div className="mt-6">
                  <PetsList pets={pets} />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </AppShell>
  );
}
