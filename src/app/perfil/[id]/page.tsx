import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { AdoptionRequestCta } from "@/components/features/adoption/AdoptionRequestCta";
import { DocumentsCard } from "@/components/features/documents/DocumentsCard";
import { PhysicalCardCta } from "@/components/features/carnet/PhysicalCardCta";
import { PetFooterBanner } from "@/components/features/pet-status/PetFooterBanner";
import { PetStatusBadge } from "@/components/features/pet-status/PetStatusBadge";
import { PetStatusSection } from "@/components/features/pet-status/PetStatusSection";
import { EmergencyContactSection } from "@/components/features/pet-profile/EmergencyContactSection";
import { HealthCard } from "@/components/features/pet-profile/HealthCard";
import { HealthExpedientePreview } from "@/components/features/pet-profile/health/HealthExpedientePreview";
import { InfoCard } from "@/components/features/pet-profile/InfoCard";
import { PetHeader } from "@/components/features/pet-profile/PetHeader";
import { ProfileNav } from "@/components/features/pet-profile/ProfileNav";
import { QRShareCard } from "@/components/features/pet-profile/QRShareCard";
import { RecentPhotos } from "@/components/features/pet-profile/RecentPhotos";
import { VaccineTimeline } from "@/components/features/pet-profile/VaccineTimeline";
import { VetCard } from "@/components/features/pet-profile/VetCard";
import { buildPhysicalPetCard } from "@/lib/domain/carnet";
import { isTerminalPetStatus } from "@/lib/domain/petStatus";
import { findShelterForPet } from "@/lib/domain/shelter";
import { sortVaccinesByDate } from "@/lib/domain/vaccine";
import { getPetByIdAny, getAllProfilePets } from "@/lib/getPetByIdAny";
import { getMockShelters } from "@/lib/getMockShelters";
import { toProfileViewModel } from "@/lib/mapping/profile";
import { toVaccineItemViewModel } from "@/lib/mapping/health";
import { buildPetProfileMetadata } from "@/lib/seo";
import { getPublicProfileUrl } from "@/lib/services/publicProfileUrl";
import { notFound } from "next/navigation";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllProfilePets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

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
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const profile = toProfileViewModel(pet);
  const publicProfileUrl = getPublicProfileUrl(pet) ?? "";
  const isTerminal = isTerminalPetStatus(profile.status);

  const vaccineViewModels = sortVaccinesByDate(pet.vacunas, "reverso")
    .slice(0, 3)
    .map((vaccine) =>
      toVaccineItemViewModel(vaccine, pet.documentos, undefined, {
        suppressAlerts: isTerminal,
      }),
    );

  const physicalCard = buildPhysicalPetCard(pet);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <PetHeader
            pet={profile.header}
            statusBadge={
              <PetStatusBadge
                petId={pet.id}
                emergency={pet.emergencia}
                status={profile.status}
              />
            }
          />
          <ProfileNav hasPhotos={profile.photos.length > 0} />
          <PetStatusSection
            petId={pet.id}
            petName={pet.mascota.nombre}
            emergency={pet.emergencia}
            whatsappNumber={pet.contacto.whatsapp}
            status={profile.status}
          />
          <AdoptionRequestCta
            petId={pet.id}
            petName={pet.mascota.nombre}
            emergency={pet.emergencia}
            status={profile.status}
            shelterName={findShelterForPet(pet.id, getMockShelters())?.nombre ?? null}
          />
          <div id="contacto" className="scroll-mt-24">
            <EmergencyContactSection
              contact={profile.contact}
              emergency={pet.emergencia}
              petId={pet.id}
              petName={pet.mascota.nombre}
              status={profile.status}
              zonaSegura={pet.contacto.zonaSegura}
            />
          </div>
          <div id="info" className="scroll-mt-24">
            <InfoCard petName={pet.mascota.nombre} info={profile.info} />
          </div>
          <div id="salud" className="scroll-mt-24">
            <HealthCard health={profile.health} />
          </div>
          <div id="veterinario" className="scroll-mt-24">
            <VetCard vet={profile.vet} />
          </div>
          {profile.photos.length > 0 ? (
            <div id="fotos" className="scroll-mt-24">
              <RecentPhotos photos={profile.photos} profilePhoto={pet.mascota.fotoPerfilUrl} />
            </div>
          ) : null}
          <div id="vacunas" className="scroll-mt-24">
            <VaccineTimeline
              petId={pet.id}
              petName={pet.mascota.nombre}
              totalCount={pet.vacunas.length}
              vaccines={vaccineViewModels}
            />
          </div>
          <div id="expediente" className="scroll-mt-24">
            <HealthExpedientePreview pet={pet} />
          </div>
          <div id="carnet" className="scroll-mt-24">
            <PhysicalCardCta
              petId={pet.id}
              petName={pet.mascota.nombre}
              card={physicalCard}
            />
          </div>
          <div id="documentos" className="grid scroll-mt-24 gap-6 md:grid-cols-[1fr_auto]">
            <DocumentsCard documents={profile.documents} documentsPath={`/perfil/${pet.id}/documentos`} />
            <QRShareCard petName={pet.mascota.nombre} profileUrl={publicProfileUrl} petCode={pet.identificacion.codigoPublico} />
          </div>
          {!isTerminal ? (
            <div className="border-t border-rule pt-8">
              <Button
                href={`/perfil/${pet.id}/alerta`}
                variant="secondary"
                icon={<AlertTriangle size={18} />}
              >
                Generar alerta de mascota perdida
              </Button>
            </div>
          ) : null}
          <PetFooterBanner
            petId={pet.id}
            petName={pet.mascota.nombre}
            species={pet.mascota.especie}
            emergency={pet.emergencia}
            status={profile.status}
          />
        </div>
      </div>
    </AppShell>
  );
}

