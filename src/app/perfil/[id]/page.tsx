import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsCard } from "@/components/features/documents/DocumentsCard";
import { LostModeAlertSections } from "@/components/features/lost-pet/LostModeAlertSections";
import { ThankYouBanner } from "@/components/features/lost-pet/ThankYouBanner";
import { EmergencyContactSection } from "@/components/features/pet-profile/EmergencyContactSection";
import { HealthCard } from "@/components/features/pet-profile/HealthCard";
import { InfoCard } from "@/components/features/pet-profile/InfoCard";
import { PetHeader } from "@/components/features/pet-profile/PetHeader";
import { ProfileNav } from "@/components/features/pet-profile/ProfileNav";
import { QRShareCard } from "@/components/features/pet-profile/QRShareCard";
import { RecentPhotos } from "@/components/features/pet-profile/RecentPhotos";
import { VaccineTimeline } from "@/components/features/pet-profile/VaccineTimeline";
import { VetCard } from "@/components/features/pet-profile/VetCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import { getPetOrNotFound } from "@/lib/getPetOrNotFound";
import { toProfileViewModel } from "@/lib/mapping/profile";
import { buildPetProfileMetadata } from "@/lib/seo";
import { getPublicProfileUrl } from "@/lib/services/publicProfileUrl";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllPets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    return {
      title: "Mascota no encontrada | PetCarnet",
      robots: { index: false },
    };
  }

  return buildPetProfileMetadata(pet);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const pet = getPetOrNotFound(id);

  const profile = toProfileViewModel(pet);
  const publicProfileUrl = getPublicProfileUrl(pet) ?? "";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-7">
          <PetHeader pet={profile.header} />
          <ProfileNav hasPhotos={profile.photos.length > 0} />
          <LostModeAlertSections
            petId={pet.id}
            petName={pet.mascota.nombre}
            emergency={pet.emergencia}
            whatsappNumber={pet.contacto.whatsapp}
          />
          <div id="contacto">
            <EmergencyContactSection
              contact={profile.contact}
              emergency={pet.emergencia}
              petId={pet.id}
              petName={pet.mascota.nombre}
              species={pet.mascota.especie}
              zonaSegura={pet.contacto.zonaSegura}
            />
          </div>
          <div id="info" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard petName={pet.mascota.nombre} info={profile.info} />
            <div id="salud">
              <HealthCard health={profile.health} />
            </div>
            <div id="veterinario">
              <VetCard vet={profile.vet} species={pet.mascota.especie} />
            </div>
          </div>
          {profile.photos.length > 0 ? (
            <div id="fotos">
              <RecentPhotos photos={profile.photos} profilePhoto={pet.mascota.fotoPerfilUrl} />
            </div>
          ) : null}
          <div id="vacunas">
            <VaccineTimeline petId={pet.id} petName={pet.mascota.nombre} totalCount={profile.vaccineTotalCount} vaccines={profile.vaccines} />
          </div>
          <div id="documentos" className="grid gap-6 md:grid-cols-[1fr_240px] lg:grid-cols-[1fr_280px]">
            <DocumentsCard documents={profile.documents} documentsPath={`/perfil/${pet.id}/documentos`} />
            <QRShareCard petName={pet.mascota.nombre} profileUrl={publicProfileUrl} petCode={pet.identificacion.codigoPublico} />
          </div>
          <Link
            href={`/perfil/${pet.id}/alerta`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(225,29,72,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(225,29,72,0.28)]"
          >
            <AlertTriangle size={18} />
            Generar alerta de mascota perdida
          </Link>
          <ThankYouBanner isLost={pet.emergencia.perdido} petName={pet.mascota.nombre} species={pet.mascota.especie} />
          <p className="text-center text-sm font-bold text-gray-400 dark:text-gray-500">
            PetCarnet © {new Date().getFullYear()} · Pasaporte Digital para Mascotas
          </p>
        </div>
      </div>
    </AppShell>
  );
}

