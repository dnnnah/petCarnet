import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  HeartHandshake,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { PrototypeNotice } from "@/components/features/adoption/PrototypeNotice";
import { ShelterPetCard } from "@/components/features/adoption/ShelterPetCard";
import { filterAdoptablePets } from "@/lib/domain/adoption";
import { findShelterById } from "@/lib/domain/shelter";
import { buildShelterPetCard, normalizeSocialUrl } from "@/lib/mapping/adoptionPresentation";
import { buildWhatsAppHref, toE164Digits } from "@/lib/phone";
import { getAdoptionDemoPets } from "@/lib/getAdoptionDemoPets";
import { getMockShelters } from "@/lib/getMockShelters";

type ShelterPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getMockShelters().map((shelter) => ({ id: shelter.id }));
}

export async function generateMetadata({ params }: ShelterPageProps): Promise<Metadata> {
  const { id } = await params;
  const shelter = findShelterById(getMockShelters(), id);

  if (!shelter) {
    return {
      title: "Refugio no encontrado | PetCarnet",
      robots: { index: false },
    };
  }

  return {
    title: `${shelter.nombre} | PetCarnet`,
    description: `${shelter.nombre} · ${shelter.ubicacion}. Perfil de refugio de demostración dentro del prototipo de adopción de PetCarnet.`,
  };
}

export default async function ShelterPage({ params }: ShelterPageProps) {
  const { id } = await params;
  const shelter = findShelterById(getMockShelters(), id);

  if (!shelter) {
    notFound();
  }

  const allPets = getAdoptionDemoPets();
  const shelterPets = allPets.filter((pet) => shelter.mascotas.includes(pet.id));
  const adoptablePets = filterAdoptablePets(shelterPets);
  const otherPets = shelterPets.filter((pet) => !adoptablePets.some((adoptable) => adoptable.id === pet.id));

  const whatsappMessage = `Hola, me interesa adoptar una mascota de ${shelter.nombre}. Vi su perfil en PetCarnet.`;
  const whatsappHref = buildWhatsAppHref(shelter.contacto.whatsapp, whatsappMessage);
  const phoneDigits = toE164Digits(shelter.contacto.telefono);
  const socialLinks = shelter.redes.map(normalizeSocialUrl).filter(Boolean);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href="/adopciones"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Volver al catálogo de adopción
          </Link>

          <SubpageHeader
            eyebrow="Refugio"
            eyebrowTone="text-violet-600"
            title={shelter.nombre}
            description={shelter.descripcion}
            icon={<Building2 size={96} />}
            background="bg-gradient-to-r from-violet-50 via-white to-indigo-50 ring-violet-100"
          />

          <PrototypeNotice />

          <section aria-labelledby="refugio-informacion" className="rounded-[2rem] bg-white p-6 shadow-[0_12px_28px_rgba(17,24,39,0.07)] ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="refugio-informacion" className="text-xl font-extrabold text-gray-950 dark:text-white">
                Información del refugio
              </h2>
              <Badge tone={shelter.verificado ? "mint" : "gray"} icon={<ShieldCheck size={16} aria-hidden="true" />}>
                {shelter.verificado ? "Refugio verificado" : "Sin verificar"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4">
              <p className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                <MapPin size={18} className="shrink-0 text-violet-500" aria-hidden="true" />
                {shelter.ubicacion}
              </p>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Persona responsable: {shelter.contacto.nombreResponsable}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {phoneDigits ? (
                <a
                  href={`tel:${phoneDigits}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <Phone size={16} aria-hidden="true" />
                  Llamar
                </a>
              ) : null}
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(22,163,74,0.24)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                </a>
              ) : null}
              {shelter.contacto.email ? (
                <a
                  href={`mailto:${shelter.contacto.email}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800"
                >
                  <Mail size={16} aria-hidden="true" />
                  Escribir correo
                </a>
              ) : null}
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-800"
                  >
                    <Link2 size={13} aria-hidden="true" />
                    {link.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </div>
            ) : null}
          </section>

          <section aria-labelledby="refugio-adoptables">
            <h2 id="refugio-adoptables" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              <HeartHandshake size={24} className="text-violet-500" aria-hidden="true" />
              Mascotas en adopción
            </h2>
            {adoptablePets.length === 0 ? (
              <div className="mt-4 grid h-48 place-items-center rounded-[1.6rem] bg-white p-6 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                <p className="max-w-sm text-sm font-bold text-gray-500 dark:text-gray-400">
                  Por el momento este refugio no tiene mascotas disponibles para adopción.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {adoptablePets.map((pet) => (
                  <ShelterPetCard key={pet.id} pet={buildShelterPetCard(pet)} />
                ))}
              </div>
            )}
          </section>

          {otherPets.length > 0 ? (
            <section aria-labelledby="refugio-otras">
              <h2 id="refugio-otras" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                <PawPrint size={24} className="text-gray-400" aria-hidden="true" />
                Otras mascotas bajo su cuidado
              </h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {otherPets.map((pet) => (
                  <ShelterPetCard key={pet.id} pet={buildShelterPetCard(pet)} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}