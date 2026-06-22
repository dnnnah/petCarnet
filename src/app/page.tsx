import Link from "next/link";
import { AlertTriangle, ArrowRight, Cat, Dog, Heart, PawPrint, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAllPets } from "@/lib/getAllPets";

export default function Home() {
  const pets = getAllPets();
  const featuredPet = pets[0];

  return (
    <AppShell>
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="absolute left-4 top-20 hidden rotate-[-14deg] text-pink-200 sm:block">
          <Heart size={44} fill="currentColor" />
        </div>
        <div className="absolute right-6 top-28 hidden rotate-12 text-amber-200 md:block">
          <PawPrint size={54} fill="currentColor" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="mint" icon={<ShieldCheck size={16} />}>
              QR publico para emergencias
            </Badge>
            <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[0.95] text-gray-950 sm:text-6xl lg:text-7xl">
              PetCarnet
            </h1>
            <p className="mt-3 text-2xl font-extrabold text-emerald-600">
              Pasaporte Digital
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
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

          <GlassCard className="relative mx-auto w-full max-w-md p-5 sm:p-6">
            <div className="absolute -left-3 top-8 h-8 w-8 rounded-full bg-pink-100" />
            <div className="absolute -right-2 bottom-16 h-10 w-10 rounded-full bg-blue-100" />
            <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-100 via-white to-pink-100 p-5">
              <div className="rounded-[1.7rem] bg-white/85 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <PawPrint size={26} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-400">
                        PetCarnet
                      </p>
                      <p className="text-xl font-extrabold text-gray-950">
                        Mascotas activas
                      </p>
                    </div>
                  </div>
                  <Heart className="text-pink-300" fill="currentColor" size={26} />
                </div>

                <div className="mt-6 grid gap-3">
                  {pets.map((pet, index) => (
                    <Link
                      key={pet.id}
                      href={`/perfil/${pet.id}`}
                      className={[
                        "group flex items-center justify-between rounded-3xl border p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5",
                        pet.emergencia.perdido
                          ? "border-rose-200 bg-rose-50/70 hover:border-rose-300"
                          : "border-gray-100 bg-white hover:border-emerald-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "grid h-11 w-11 place-items-center rounded-2xl",
                            index % 2 === 0
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-pink-100 text-pink-500",
                          ].join(" ")}
                        >
                          {pet.mascota.especie === "Gato" ? <Cat size={22} /> : <Dog size={22} />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-extrabold text-gray-950">{pet.mascota.nombre}</p>
                            {pet.emergencia.perdido ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-extrabold text-rose-700 ring-1 ring-rose-200">
                                <AlertTriangle size={12} />
                                Perdido
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm font-semibold text-gray-500">
                            {pet.mascota.especie}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className="text-gray-300 transition group-hover:text-emerald-500"
                        size={20}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </AppShell>
  );
}
