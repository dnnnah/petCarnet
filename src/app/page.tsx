
import { ArrowRight, HeartHandshake, QrCode, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { PetsList } from "@/components/features/home/PetsList";
import { Section } from "@/components/ui/Section";
import { getAllPets } from "@/lib/getAllPets";

const STEPS = [
  {
    icon: UserRound,
    title: "El tutor publica lo que decide",
    body: "Nombre, foto, rasgo y contacto. Nada se comparte sin permiso.",
  },
  {
    icon: QrCode,
    title: "El perfil se imprime o se comparte",
    body: "Un QR en el collar o la mochila lleva al carnet público.",
  },
  {
    icon: ShieldCheck,
    title: "Cualquiera puede ayudar",
    body: "Quien encuentre a la mascota ve teléfono, salud y cómo reportarla.",
  },
];

export default function Home() {
  const pets = getAllPets();
  const featuredPet = pets[0];

  return (
    <AppShell>
      <section className="border-b border-rule">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="overline text-brand">Carnet digital para mascotas</p>
          <h1 className="mt-4 max-w-3xl text-[2.25rem] leading-[1.05] text-ink sm:text-6xl">
            Si la pierdes, que cualquiera pueda devolverla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-2">
            PetCarnet convierte los datos de tu mascota en un carnet público con QR: identidad,
            salud y contacto de emergencia en un solo lugar, siempre a tu control.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {featuredPet ? (
              <Button href={`/perfil/${featuredPet.id}`} size="lg" iconEnd={<ArrowRight size={18} />}>
                Ver el perfil de {featuredPet.mascota.nombre}
              </Button>
            ) : null}
            <Button
              href="/adopciones"
              variant="secondary"
              size="lg"
              icon={<HeartHandshake size={18} />}
            >
              Ver mascotas en adopción
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Cómo funciona" className="border-b border-rule bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="border-t border-rule pt-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-soft text-brand">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="tnum text-xs font-semibold text-ink-3">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-3.5 text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-2">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section
        id="mascotas"
        as="h2"
        eyebrow="Mascotas registradas"
        title="Elige un carnet para verlo completo"
        description="Cada perfil reúne identificación, salud y contacto de emergencia."
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        bodyClassName="scroll-mt-24"
      >
        <PetsList pets={pets} />
      </Section>
    </AppShell>
  );
}
